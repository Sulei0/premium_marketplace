import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

let _supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    "⚠️ VITE_SUPABASE_URL ve/veya VITE_SUPABASE_ANON_KEY tanımlanmamış. " +
    "Auth ve veritabanı özellikleri devre dışı. Lütfen .env dosyanızı oluşturun."
  );
}

/** Supabase client — null if env vars are missing */
export const supabase = _supabase;

/** Type-safe helper: true when Supabase is configured */
export function isSupabaseReady(): _supabase is SupabaseClient {
  return _supabase !== null;
}
