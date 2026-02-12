-- Add is_blocked column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Add is_approved column to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- RLS Policies for Profiles (Admins can update everything)
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for Products (Admins can do everything)
CREATE POLICY "Admins can delete any product"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update any product"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Ensure admins can see unapproved/inactive products if RLS hides them
-- Existing policies might be "Anyone can view active products", so we need "Admins can view ALL products"
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Blocked users policy (prevent login/access effectively)
-- This is tricky with RLS since we want to block them from reading data too?
-- For now, let's just use the column and handle the enforcement in the application or specific policies if needed.
-- But usually, blocking a user means they can't do anything. 
-- Adding a policy to every table to check is_blocked is expensive.
-- Best practice: Check is_blocked in a few key places or use a hook/middleware.
-- We will handle is_blocked enforcement in the frontend AdminRoute and potentially a database trigger if strict security is needed.
