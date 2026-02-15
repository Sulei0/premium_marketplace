-- ============================================================
-- Rol Enjeksiyonu (Role Injection) Düzeltmesi
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
  final_role TEXT;
  extracted_username TEXT;
BEGIN
  -- Meta veriden rolü al
  requested_role := NEW.raw_user_meta_data->>'role';
  
  -- Güvenlik Kontrolü:
  -- Eğer 'admin' isteniyorsa, bunu YOK SAY ve 'buyer' yap.
  -- Sadece 'seller' veya 'buyer' kabul et.
  IF requested_role = 'seller' THEN
    final_role := 'seller';
  ELSIF requested_role = 'buyer' THEN
    final_role := 'buyer';
  ELSE
    -- 'admin' dahil diğer her şey için varsayılan 'buyer'
    final_role := 'buyer';
  END IF;

  -- Username belirle
  extracted_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    extracted_username,
    final_role
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
