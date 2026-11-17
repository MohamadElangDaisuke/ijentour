import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

// Support both new Supabase publishable keys and legacy anon keys
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

// Support both new Supabase secret key and legacy service role key
// Server-side only: NEVER expose this key to the client/browser!
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

/**
 * Public Supabase Client (safe for client-side and public queries)
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Server-only Supabase Admin Client (using SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY)
 * WARNING: NEVER use this in client components or expose to browser!
 */
export const supabaseAdmin =
  supabaseUrl && supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;
