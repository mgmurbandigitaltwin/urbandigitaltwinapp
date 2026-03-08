import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if credentials are missing to prevent app crash
// The app will still function with demo accounts
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signUp: async () => ({ data: { user: null }, error: new Error('Supabase credentials not configured') }),
        signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase credentials not configured') }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null })
      },
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ data: null, error: null }), single: () => ({ data: null, error: null }) }) }),
        insert: () => Promise.resolve({ error: null }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) })
      })
    } as any;
