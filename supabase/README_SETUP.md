# Supabase Kurulum Rehberi

## 1. Proje Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard) adresine gidin
2. Yeni proje oluşturun
3. **Project Settings > API** bölümünden:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 2. Ortam Değişkenleri

Proje kökünde `.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Veritabanı Migration

Supabase Dashboard'da **SQL Editor**'e gidin ve `supabase/migrations/20250101000000_create_profiles.sql` dosyasındaki SQL'i çalıştırın.

Bu işlem:
- `profiles` tablosunu oluşturur
- RLS politikalarını ayarlar
- Yeni kullanıcı kaydında otomatik profil oluşturan trigger'ı ekler

## 4. E-posta Onayı (Opsiyonel)

Geliştirme aşamasında anında giriş için **Authentication > Providers > Email** ayarlarında "Confirm email" seçeneğini kapatabilirsiniz.
