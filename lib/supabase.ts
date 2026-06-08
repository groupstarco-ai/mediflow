import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vabiqigbuucxgzwgfwcu.supabase.co'
const supabaseAnonKey = 'sb_publishable_UI2DhwxcgMmT8_jLIR_sHA_xiSi6BZU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
