-- Add missing columns for offer system to messages table

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS offer_amount NUMERIC,
ADD COLUMN IF NOT EXISTS offer_status TEXT DEFAULT 'pending', -- pending, accepted, rejected
ADD COLUMN IF NOT EXISTS offer_details JSONB;

-- Ensure is_offer exists (it might already, but good to be safe)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT false;

-- Add index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_messages_is_offer ON messages(is_offer);
