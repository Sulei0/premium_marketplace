-- Add avatar_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create a secure function to allow users to delete their own account
-- This function deletes the user from auth.users, which cascades to public.profiles via ON DELETE CASCADE
CREATE OR REPLACE FUNCTION public.delete_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is deleting their own account based on the current session
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users
  -- This requires the function to be SECURITY DEFINER to have access to auth schema
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
