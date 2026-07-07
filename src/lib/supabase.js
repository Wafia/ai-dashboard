import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jynyxvwvttmthiesfiya.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xBimyzu7c5LprkX3YOTnRw_UIMdBVc6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
