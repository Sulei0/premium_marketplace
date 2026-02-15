-- Add is_sold column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT false;

-- Update RLS if necessary (Optional, but good practice)
-- Ideally, we want 'is_sold' products to be visible via direct link (ProductDetail), 
-- but maybe not in the main list. 
-- Existing policies usually rely on 'is_active'. 
-- We will handle visibility via query filters in the frontend for lists.
