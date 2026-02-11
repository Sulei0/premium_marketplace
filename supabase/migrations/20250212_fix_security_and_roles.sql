-- ============================================================
-- Güvenlik İyileştirmeleri ve Rol Yönetimi Düzeltmeleri
-- ============================================================

-- 1. Profiles Tablosu Güvenliği (Yetki Yükseltme Önlemi)
-- Kullanıcıların kendi profillerini güncellerken 'role' veya 'is_admin' alanlarını değiştirmesini engelle.

-- Mevcut 'Profiles can update own data' politikasını kaldır.
DROP POLICY IF EXISTS "Profiles can update own data" ON public.profiles;

-- Yeni güncelleme politikasını oluştur.
-- Bu politika, kullanıcıların sadece kendi satırlarını güncelleyebileceğini belirtir,
-- ancak hangi sütunların güncellendiği veritabanı seviyesinde kontrol edilmelidir.
-- Supabase GUI üzerinden sütun bazlı yetkilendirme yapılabilir, ancak SQL ile en sağlıklısı
-- bir TRIGGER kullanmak veya sadece izin verilen sütunları update eden bir fonksiyon kullanmaktır.
-- Alternatif olarak, RLS CHECK ifadesinde (mevcut değerlerin değişmediğini) kontrol edebiliriz.

CREATE POLICY "Profiles can update own data details"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- role ve is_admin alanlarının değiştirilmediğini kontrol et
    AND (
      role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid())
      OR
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IS NULL -- Eğer henüz rolü yoksa (nadiren)
    )
    AND (
      is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    )
  );


-- 2. Chat Spam Önleme (Self-Chat Engelleme)
-- Alıcının (buyer) kendine (seller) mesaj atmasını engelle.

-- Mevcut 'Users can insert chats' politikasını kaldır.
DROP POLICY IF EXISTS "Users can insert chats" ON public.chats;

-- Yeni chat ekleme politikası
CREATE POLICY "Users can insert chats (secure)"
  ON public.chats FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id 
    AND 
    buyer_id != seller_id -- Kendine mesaj atamaz
  );


-- 3. Rol Yönetimi (is_admin deprecation)
-- is_admin sütununu, role = 'admin' ile senkronize tutan bir trigger ekleyelim (geriye dönük uyumluluk için).

CREATE OR REPLACE FUNCTION public.sync_is_admin_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    NEW.is_admin := true;
  ELSE
    NEW.is_admin := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_is_admin ON public.profiles;

CREATE TRIGGER trigger_sync_is_admin
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_is_admin_flag();
