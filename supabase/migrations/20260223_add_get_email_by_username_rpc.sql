-- supabase/migrations/20260223_add_get_email_by_username_rpc.sql

-- Define a security definer function to get email by username
-- This allows an unauthenticated user to look up the email
-- associated with a username during the login process.

CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Look up the email by finding the corresponding user profile
  -- We join the public.profiles table (where the username lives)
  -- with the auth.users table (where the email lives)
  SELECT u.email INTO v_email
  FROM auth.users AS u
  INNER JOIN public.profiles AS p ON p.id = u.id
  WHERE p.username = p_username;

  -- Return the email, or NULL if not found
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon, authenticated;
