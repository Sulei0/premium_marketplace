-- ============================================
-- #5 Veritabanı İndeksleme — Products Tablosu
-- ============================================
-- Ürün sayısı arttıkça sorgu performansını korumak için
-- title, category ve price sütunlarına indeksler ekleniyor.

-- Kategori filtreleme: WHERE category = 'Çorap'
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

-- Fiyat sıralama/filtreleme: ORDER BY price, WHERE price BETWEEN ...
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);

-- Başlık arama: Trigram tabanlı GIN indeksi sayesinde
-- ILIKE '%arama%' sorguları da indeksten yararlanır.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON products USING gin (title gin_trgm_ops);

-- Sıklıkla kullanılan combined sorgu:
-- WHERE is_active = true ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_products_active_created ON products (is_active, created_at DESC);

-- user_id ile ürün sahipliği sorguları
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products (user_id);
