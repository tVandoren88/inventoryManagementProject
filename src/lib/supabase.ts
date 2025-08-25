import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY!;


if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase URL or Anon Key is missing!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
