-- Add badges column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';

-- Create a function to assign a badge (Admin only)
CREATE OR REPLACE FUNCTION public.assign_badge(target_user_id uuid, badge_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the executor is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can assign badges';
  END IF;

  -- Add the badge if it doesn't exist
  UPDATE public.profiles
  SET badges = array_append(badges, badge_name)
  WHERE id = target_user_id AND NOT (badges @> ARRAY[badge_name]);
END;
$$;

-- Create a function to remove a badge (Admin only)
CREATE OR REPLACE FUNCTION public.remove_badge(target_user_id uuid, badge_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the executor is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can remove badges';
  END IF;

  -- Remove the badge
  UPDATE public.profiles
  SET badges = array_remove(badges, badge_name)
  WHERE id = target_user_id;
END;
$$;

-- RLS Policy for badges updates (Just in case direct update is attempted)
-- Note: The standard "Users can update own profile" policy usually covers all columns.
-- We might need to restrict that if we want to be strict, but creating specific functions is safer.
-- However, if there is a general "Users can update own profile" policy, it might allow them to update badges too.
-- Let's check if we can prevent that. 
-- Ideally we should split the RLS, but for now, we rely on the client not sending badges update and the functions being the primary admin way.
-- If we want to strictly prevent users from updating their own badges via standard UPDATE, we would need to change the existing policy to exclude 'badges' column, 
-- or create a trigger. For this implementation, we will assume standard fair use and admin tools use the RPC.

-- Actually, a trigger is safer to strict enforcement.
CREATE OR REPLACE FUNCTION public.protect_badges_column()
RETURNS TRIGGER AS $$
BEGIN
  -- If badges column is being modified
  IF NEW.badges IS DISTINCT FROM OLD.badges THEN
    -- Allow if it's an admin (or if the function is called with logic that allows it, but here we check the user role)
    -- However, since we use SECURITY DEFINER functions for admin actions, the auth.uid() inside those functions will be the caller.
    -- If the user calls 'UPDATE profiles', auth.uid() is them.
    -- If the user calls 'assign_badge', the function runs as owner? No, SECURITY DEFINER runs as owner.
    
    -- Let's simplify: If the user is NOT admin, they cannot change badges.
    -- But if they update their profile (bio, etc), the badges array should remain same.
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
        -- If it's a self-update, prevent badge changes
        NEW.badges := OLD.badges;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication errors during re-runs
DROP TRIGGER IF EXISTS tr_protect_badges ON public.profiles;

-- Create trigger
CREATE TRIGGER tr_protect_badges
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_badges_column();
