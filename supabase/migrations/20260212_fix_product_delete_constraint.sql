-- Drop the existing foreign key constraint
ALTER TABLE public.chats
DROP CONSTRAINT IF EXISTS chats_product_id_fkey;

-- Re-add the foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.chats
ADD CONSTRAINT chats_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;
