-- Köşe Blog System — Database Migration
-- Bu migration'ı Supabase SQL Editor'da çalıştırın.

-- 1. blog_posts tablosunu oluştur
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL DEFAULT '',
    cover_image TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Slug üzerinde index (hızlı lookup)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- 3. Yayınlanan yazılar için index
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, created_at DESC);

-- 4. RLS Politikaları
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Herkes yayınlanan yazıları okuyabilir
CREATE POLICY "Public can read published posts"
    ON blog_posts FOR SELECT
    USING (is_published = true);

-- Admin tüm yazıları okuyabilir
CREATE POLICY "Admins can read all posts"
    ON blog_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admin yazı oluşturabilir
CREATE POLICY "Admins can insert posts"
    ON blog_posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admin yazı güncelleyebilir
CREATE POLICY "Admins can update posts"
    ON blog_posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admin yazı silebilir
CREATE POLICY "Admins can delete posts"
    ON blog_posts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
