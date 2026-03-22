-- 1. Profiles tablosuna telefon ve doğrulama durumu ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text UNIQUE,
ADD COLUMN IF NOT EXISTS is_phone_verified boolean DEFAULT false;

-- 2. OTP Kodlarının tutulacağı tablo (Süreli ve güvenli)
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    phone text NOT NULL,
    code text NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- RLS for otp_codes (No public access, only accessible via SECURITY DEFINER functions)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- 3. OTP Üretme Fonksiyonu (RPC)
-- Kullanıcıya bir kod üretir, tabloya yazar ve kodu (Test/Dev amacı veya SMS Sağlayıcısına göndermek için) geri döner.
CREATE OR REPLACE FUNCTION generate_phone_otp(p_user_id uuid, p_phone text)
RETURNS text AS $$
DECLARE
    v_code text;
BEGIN
    -- Önceki bekleyen kodları temizle (Eski kodlar geçersiz kılınır)
    DELETE FROM public.otp_codes WHERE user_id = p_user_id;

    -- 6 Haneli rastgele sayı üret
    v_code := lpad(floor(random() * 1000000)::text, 6, '0');

    -- Yeni kodu 3 dakika (180 saniye) geçerli olacak şekilde ekle
    INSERT INTO public.otp_codes (user_id, phone, code, expires_at)
    VALUES (p_user_id, p_phone, v_code, now() + interval '3 minutes');

    -- Profil tablosunda telefonu güncelle ve is_phone_verified = false yap
    UPDATE public.profiles
    SET phone = p_phone, is_phone_verified = false
    WHERE id = p_user_id;

    -- Kod başarılı üretildi. 
    -- Gerçek hayatta burada sms API'sine (Netgsm vs.) curl atılır veya Edge Function tetiklenir.
    -- Şimdilik frontend'e dönüyoruz ki Geliştirme (Dev) ortamında test edilebilsin veya frontend üzerinden SMS API'sine ulaşılsın.
    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. OTP Doğrulama Fonksiyonu (RPC)
-- Gelen telefon ve kodu eşleştirir, doğruysa profili onaylar.
CREATE OR REPLACE FUNCTION verify_phone_otp(p_user_id uuid, p_phone text, p_code text)
RETURNS boolean AS $$
DECLARE
    v_is_valid boolean;
BEGIN
    -- Kod hala geçerli mi ve doğru mu kontrol et
    SELECT EXISTS (
        SELECT 1 FROM public.otp_codes
        WHERE user_id = p_user_id
          AND phone = p_phone
          AND code = p_code
          AND expires_at > now()
    ) INTO v_is_valid;

    IF v_is_valid THEN
        -- Kod doğru: Profili onayla
        UPDATE public.profiles
        SET is_phone_verified = true
        WHERE id = p_user_id;

        -- Kullanılmış / Başarılı olan kodu tablodan sil (Tek kullanımlık)
        DELETE FROM public.otp_codes WHERE user_id = p_user_id;
        
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
