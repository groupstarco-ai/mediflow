import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables Supabase sont manquantes dans .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseClient = supabase

export async function getStructureId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('utilisateurs')
    .select('structure_id')
    .eq('auth_id', user.id)
    .single()
  return data?.structure_id || null
}