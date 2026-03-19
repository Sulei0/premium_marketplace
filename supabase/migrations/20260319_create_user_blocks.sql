-- ============================================================
-- Kullanıcılar Arası Engelleme Sistemi (User-to-User Blocking)
-- ============================================================

-- 1. user_blocks tablosu
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- 2. Indexler
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);

-- 3. RLS Etkinleştir
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Politikaları

-- Kullanıcı kendi engel kayıtlarını görebilir (engelleyen veya engellenen olarak)
CREATE POLICY "Users can view own blocks"
    ON public.user_blocks FOR SELECT
    USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

-- Kullanıcı sadece kendi adına engel ekleyebilir
CREATE POLICY "Users can insert own blocks"
    ON public.user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id AND blocker_id != blocked_id);

-- Kullanıcı sadece kendi engellerini kaldırabilir
CREATE POLICY "Users can delete own blocks"
    ON public.user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

-- 5. Karşılıklı engel kontrolü RPC
-- Herhangi bir yönde engel olup olmadığını kontrol eder
CREATE OR REPLACE FUNCTION public.check_is_blocked(p_user_id UUID, p_target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_blocks
        WHERE (blocker_id = p_user_id AND blocked_id = p_target_id)
           OR (blocker_id = p_target_id AND blocked_id = p_user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Engellenen kullanıcının mesaj göndermesini engelleyen RLS güncellemesi
-- Mesaj tablosunda: engelleyen veya engellenen kullanıcı mesaj gönderemez
-- Bu, mevcut message insert policy'ye ek bir kontrol ekler

-- Önce mevcut chat insert policy'leri kontrol edelim ve güvenli şekilde güncelleyelim
-- Not: Mevcut policy isimleri farklı olabilir, bu yüzden IF EXISTS kullanıyoruz

-- Messages tablosuna engel kontrolü ekle
DROP POLICY IF EXISTS "Users can insert messages (secure_blocked_check)" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages (with_block_check)" ON public.messages;

CREATE POLICY "Users can insert messages (with_block_check)"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND NOT public.is_user_blocked()
        AND NOT EXISTS (
            SELECT 1 FROM public.user_blocks ub
            JOIN public.chats c ON c.id = chat_id
            WHERE (
                (ub.blocker_id = auth.uid() AND (ub.blocked_id = c.buyer_id OR ub.blocked_id = c.seller_id))
                OR
                (ub.blocked_id = auth.uid() AND (ub.blocker_id = c.buyer_id OR ub.blocker_id = c.seller_id))
            )
        )
    );

-- Reviews tablosuna engel kontrolü ekle
DROP POLICY IF EXISTS "Users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews (with_block_check)" ON public.reviews;

CREATE POLICY "Users can insert reviews (with_block_check)"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND reviewer_id != seller_id
        AND NOT public.check_is_blocked(reviewer_id, seller_id)
    );

-- Follows tablosuna engel kontrolü ekle
DROP POLICY IF EXISTS "Users can insert follows" ON public.follows;
DROP POLICY IF EXISTS "Users can insert follows (with_block_check)" ON public.follows;

CREATE POLICY "Users can insert follows (with_block_check)"
    ON public.follows FOR INSERT
    WITH CHECK (
        auth.uid() = follower_id
        AND follower_id != following_id
        AND NOT public.check_is_blocked(follower_id, following_id)
    );
