import { createClient } from '@supabase/supabase-js'

// Admin client for server-side operations (embeddings, etc.)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)