-- ============================================
-- Chat Sistemi İyileştirmeleri
-- ============================================

-- 1. messages tablosu UPDATE politikası
-- Sadece sohbetteki karşı tarafın mesajlarının read_at alanını güncelleyebilir
CREATE POLICY "Users can update read_at on messages in their chats"
  ON public.messages FOR UPDATE
  USING (
    -- Mesaj karşı taraftan gelmiş olmalı (kendi mesajını okundu işaretleyemez)
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
  )
  WITH CHECK (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
  );

-- 2. Yeni mesaj eklendiğinde chats.updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats
  SET updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_chat_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_updated_at();

-- 3. messages.chat_id indeksi (performans)
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages (chat_id, created_at);

-- 4. messages.sender_id indeksi
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
