-- Fix handle_new_user trigger to handle OAuth users gracefully
-- OAuth users won't have a 'username' in metadata, so we generate one from their email.
-- We add a random suffix to prevent UNIQUE constraint violations on the username column.
-- We also track whether the user has explicitly set their username.

-- Add username_set column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_set BOOLEAN DEFAULT true;

-- Update existing trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  username_exists BOOLEAN;
  has_explicit_username BOOLEAN;
BEGIN
  -- Check if user provided a username (email/password signup)
  has_explicit_username := (NEW.raw_user_meta_data->>'username') IS NOT NULL
                           AND (NEW.raw_user_meta_data->>'username') != '';

  -- Use provided username from metadata, or derive from OAuth profile / email
  new_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    split_part(NEW.email, '@', 1)
  );

  -- Replace spaces with underscores for names from OAuth providers
  new_username := REPLACE(new_username, ' ', '_');

  -- Check if username already exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = new_username) INTO username_exists;

  -- If username exists, append a random 4-char suffix
  IF username_exists THEN
    new_username := new_username || '_' || substr(md5(random()::text), 1, 4);
  END IF;

  INSERT INTO public.profiles (id, username, role, username_set)
  VALUES (
    NEW.id,
    new_username,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    has_explicit_username
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
