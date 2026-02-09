import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

function createSupabaseClient() {
  try {
    const url = supabaseUrl || "https://placeholder.supabase.co";
    const key = supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
    return createClient<Database>(url, key);
  } catch {
    const url = "https://placeholder.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
    return createClient<Database>(url, key);
  }
}

export const supabase = createSupabaseClient();
