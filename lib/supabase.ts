import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables Supabase sont manquantes dans .env.local')
}

// Client standard
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client avec session utilisateur (pour le RLS)
export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)

export async function getStructureId(): Promise<string | null> {
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) return null
  const { data } = await supabaseClient
    .from('utilisateurs')
    .select('structure_id')
    .eq('auth_id', user.id)
    .single()
  return data?.structure_id || null
}