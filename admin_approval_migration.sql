-- Admin Approval System Migration
-- Bu migration, ilanların admin onayı gerektirmesi için gerekli değişiklikleri yapar.

-- 1. products tablosunda is_approved sütununun default değerini false yap
-- (Yeni oluşturulan ilanlar otomatik olarak onay bekliyor durumunda başlasın)
ALTER TABLE products ALTER COLUMN is_approved SET DEFAULT false;

-- 2. Mevcut tüm ilanları onaylı olarak bırak (geriye dönük uyumluluk)
-- Yeni ilanlar is_approved = false olarak oluşturulacak.
-- Mevcut ilanları etkilememek için bu migration sadece default değeri değiştirir.
