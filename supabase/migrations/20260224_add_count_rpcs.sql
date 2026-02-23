-- 20260224_add_count_rpcs.sql

-- 1. Get favorite count for a single product (or all products if needed, but per-product is safer)
CREATE OR REPLACE FUNCTION public.get_product_favorite_count(p_product_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.favorites
  WHERE product_id = p_product_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Get follower count for a user
CREATE OR REPLACE FUNCTION public.get_user_follower_count(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.follows
  WHERE following_id = p_user_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Get following count for a user
CREATE OR REPLACE FUNCTION public.get_user_following_count(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.follows
  WHERE follower_id = p_user_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Get multiple product favorite counts at once (useful for lists)
-- Accepts an array of product IDs and returns a JSON object mapping ID to count
CREATE OR REPLACE FUNCTION public.get_multiple_favorite_counts(p_product_ids UUID[])
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_object_agg(product_id, count) INTO result
  FROM (
    SELECT product_id, COUNT(*) as count
    FROM public.favorites
    WHERE product_id = ANY(p_product_ids)
    GROUP BY product_id
  ) AS counts;
  
  RETURN COALESCE(result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
