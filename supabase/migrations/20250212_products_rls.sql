-- ============================================================
-- Products Tablosu: RLS Güvenlik Politikaları
-- KRİTİK: Bu SQL'i Supabase SQL Editor'da çalıştırın!
-- ============================================================

-- 1. RLS'yi etkinleştir
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. SELECT: Herkes aktif ürünleri görebilir (public marketplace)
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- 3. INSERT: Sadece giriş yapmış kullanıcı, kendi user_id'si ile ürün ekleyebilir
CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. UPDATE: Sadece ürün sahibi güncelleyebilir
CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. DELETE: Sadece ürün sahibi silebilir
CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);
