-- ============================================================
-- Blocklanan Kullanıcılar için RLS Güvenlik Yaması
-- ============================================================

-- 1. Helper function to check if the current user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user has is_blocked = true in profiles
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_blocked = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Products Policies
-- Drop existing relevant policies to recreate them securely
-- Note: naming might vary, checking standard names or just creating new ones with higher priority if possible, 
-- but explicit replace is better. We will drop likely existing ones.

-- FOR SELECT: Previously "Anyone can view products" or similar
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;

-- Recreate with blocked check
CREATE POLICY "Anyone can view products (secure)"
  ON public.products FOR SELECT
  USING (
    -- User is NOT blocked (if logged in) OR not logged in (public view might be allowed, but usually blocked users shouldn't see?)
    -- If we want blocked users to see NOTHING, we enforce check. 
    -- If "Anyone" includes visitors, `auth.uid()` is null. 
    -- So: (auth.role() = 'anon') OR (auth.role() = 'authenticated' AND NOT is_user_blocked())
    (auth.role() = 'anon') 
    OR 
    (auth.role() = 'authenticated' AND NOT public.is_user_blocked())
  );

CREATE POLICY "Users can insert own products (secure)"
  ON public.products FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT public.is_user_blocked()
  );

CREATE POLICY "Users can update own products (secure)"
  ON public.products FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND NOT public.is_user_blocked()
  );

CREATE POLICY "Users can delete own products (secure)"
  ON public.products FOR DELETE
  USING (
    auth.uid() = user_id 
    AND NOT public.is_user_blocked()
  );


-- 3. Update Chat/Message Policies
-- Chats
DROP POLICY IF EXISTS "Users can insert chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert chats (secure)" ON public.chats; -- Dropping the one we might have made directly before

CREATE POLICY "Users can insert chats (secure_blocked_check)"
  ON public.chats FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id 
    AND buyer_id != seller_id
    AND NOT public.is_user_blocked()
  );

-- Messages
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;

CREATE POLICY "Users can insert messages (secure_blocked_check)"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT public.is_user_blocked()
  );
