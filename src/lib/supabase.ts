import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Chybí Supabase konfigurace v .env souboru. Zkopírujte .env.example do .env a vyplňte hodnoty.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);