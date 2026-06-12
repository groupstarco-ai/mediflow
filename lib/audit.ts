import { supabase, getStructureId } from './supabase'

export async function enregistrerAction(
  action: string,
  module: string,
  details?: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  const structureId = await getStructureId()

  await supabase.from('audit_logs').insert([{
    utilisateur_email: user?.email || 'inconnu',
    action,
    module,
    details: details || '',
    structure_id: structureId,
  }])
}