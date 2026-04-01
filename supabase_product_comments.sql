-- =====================================================
-- Product Comments Table — Dolap-style comment system
-- =====================================================

CREATE TABLE IF NOT EXISTS product_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_comments(id) ON DELETE CASCADE,  -- for replies
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_comments_product ON product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_user ON product_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_parent ON product_comments(parent_id);

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments
CREATE POLICY "Anyone can read product comments"
  ON product_comments FOR SELECT
  USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert comments"
  ON product_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON product_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can delete any comment
CREATE POLICY "Admin can delete any comment"
  ON product_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Product owner can delete comments on their own products
CREATE POLICY "Product owner can delete comments on own products"
  ON product_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_comments.product_id
        AND products.user_id = auth.uid()
    )
  );

-- =====================================================
-- Backend Spam Protection Trigger
-- Prevents bypassing frontend limits via DevTools/API
-- Product owner is exempt from comment count limit
-- =====================================================

CREATE OR REPLACE FUNCTION check_comment_limit()
RETURNS TRIGGER AS $$
DECLARE
  comment_count INTEGER;
  last_comment_time TIMESTAMPTZ;
  is_product_owner BOOLEAN;
BEGIN
  -- Check if user is the product owner (exempt from count limit)
  SELECT EXISTS(
    SELECT 1 FROM products
    WHERE id = NEW.product_id AND user_id = NEW.user_id
  ) INTO is_product_owner;

  -- Comment count check (max 5 per user per product, owners exempt)
  IF NOT is_product_owner THEN
    SELECT COUNT(*) INTO comment_count
    FROM product_comments
    WHERE product_id = NEW.product_id AND user_id = NEW.user_id;

    IF comment_count >= 5 THEN
      RAISE EXCEPTION 'Bu ilan için yorum sınırına ulaştınız (5/5)';
    END IF;
  END IF;

  -- Cooldown check (30 seconds between comments, applies to everyone)
  SELECT MAX(created_at) INTO last_comment_time
  FROM product_comments
  WHERE user_id = NEW.user_id;

  IF last_comment_time IS NOT NULL AND
     (NOW() - last_comment_time) < INTERVAL '30 seconds' THEN
    RAISE EXCEPTION 'Çok sık yorum yapıyorsunuz. Lütfen 30 saniye bekleyin.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if present (for re-runs)
DROP TRIGGER IF EXISTS enforce_comment_limit ON product_comments;

CREATE TRIGGER enforce_comment_limit
  BEFORE INSERT ON product_comments
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_limit();
