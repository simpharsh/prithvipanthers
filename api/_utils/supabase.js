import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const publicSupabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const adminSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const publicSupabase = supabaseUrl && publicSupabaseKey ? createClient(supabaseUrl, publicSupabaseKey) : null;
export const adminSupabase = supabaseUrl && adminSupabaseKey ? createClient(supabaseUrl, adminSupabaseKey) : null;

export const getDb = () => adminSupabase || publicSupabase;
export const isAdminDbConnected = !!adminSupabase;
export const isPublicDbConnected = !!publicSupabase;
