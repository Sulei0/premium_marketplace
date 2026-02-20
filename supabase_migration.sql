-- =============================================
-- Giyenden — Veritabanı Migration
-- reports tablosu, FK constraints, indeksler ve 
-- admin rolü koruma trigger'ı
-- =============================================

-- ==========================================
-- 1) REPORTS TABLOSU
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Giriş yapmış kullanıcılar rapor oluşturabilsin
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reports' AND tablename = 'reports') THEN
        CREATE POLICY "Users can create reports"
            ON public.reports FOR INSERT TO authenticated
            WITH CHECK (auth.uid() = reporter_id);
    END IF;
END $$;

-- Admin tüm raporları görebilsin, kullanıcı kendi raporlarını görebilsin
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'View reports' AND tablename = 'reports') THEN
        CREATE POLICY "View reports"
            ON public.reports FOR SELECT TO authenticated
            USING (
                auth.uid() = reporter_id
                OR EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Admin raporları güncelleyebilsin
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can update reports' AND tablename = 'reports') THEN
        CREATE POLICY "Admin can update reports"
            ON public.reports FOR UPDATE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- ==========================================
-- 2) VERİTABANI İNDEKSLERİ (Performans)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_approved ON products(is_approved);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ==========================================
-- 3) ADMİN ROLÜ KORUMA TRİGGER'I
-- Kullanıcılar kendi rollerini 'admin' yapamamalı
-- ==========================================
CREATE OR REPLACE FUNCTION prevent_self_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'admin' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Kendinizi admin olarak yükseltemezsiniz!';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_admin_promotion ON public.profiles;

CREATE TRIGGER prevent_admin_promotion
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION prevent_self_admin_promotion();

-- ==========================================
-- 4) MESAJLAŞMA GÜVENLİĞİ (Chat & Messages RLS)
-- ==========================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Chat participants only' AND tablename = 'chats') THEN
        CREATE POLICY "Chat participants only"
            ON public.chats FOR SELECT TO authenticated
            USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Message read by participants' AND tablename = 'messages') THEN
        CREATE POLICY "Message read by participants"
            ON public.messages FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.chats
                    WHERE chats.id = messages.chat_id
                    AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
                )
            );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Message insert by participants' AND tablename = 'messages') THEN
        CREATE POLICY "Message insert by participants"
            ON public.messages FOR INSERT TO authenticated
            WITH CHECK (
                auth.uid() = sender_id
                AND EXISTS (
                    SELECT 1 FROM public.chats
                    WHERE chats.id = chat_id
                    AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
                )
            );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Message read receipt update' AND tablename = 'messages') THEN
        CREATE POLICY "Message read receipt update"
            ON public.messages FOR UPDATE TO authenticated
            USING (
                sender_id != auth.uid()
                AND EXISTS (
                    SELECT 1 FROM public.chats
                    WHERE chats.id = messages.chat_id
                    AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
                )
            );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);
