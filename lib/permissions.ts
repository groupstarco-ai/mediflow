import { supabase } from './supabase'

export type Role = 'administrateur' | 'medecin' | 'infirmier' | 'gestionnaire' | 'patient'
export type Module = 'patients' | 'rendez_vous' | 'dossiers' | 'facturation' | 'medecins' | 'statistiques' | 'parametres'

export interface Permission {
  peut_voir: boolean
  peut_creer: boolean
  peut_modifier: boolean
  peut_supprimer: boolean
}

// Cache des permissions pour éviter trop de requêtes
let permissionsCache: any = null

export async function getPermissions(role: Role): Promise<Record<Module, Permission>> {
  if (permissionsCache?.[role]) return permissionsCache[role]

  const { data } = await supabase
    .from('permissions')
    .select('*')
    .eq('role', role)

  const perms: Record<string, Permission> = {}
  if (data) {
    data.forEach((p: any) => {
      perms[p.module] = {
        peut_voir: p.peut_voir,
        peut_creer: p.peut_creer,
        peut_modifier: p.peut_modifier,
        peut_supprimer: p.peut_supprimer,
      }
    })
  }

  if (!permissionsCache) permissionsCache = {}
  permissionsCache[role] = perms
  return perms
}

export async function getUserRole(): Promise<Role | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('utilisateurs')
    .select('role')
    .eq('email', user.email)
    .single()

  return data?.role || null
}

export async function peutAcceder(module: Module, action: keyof Permission = 'peut_voir'): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false
  if (role === 'administrateur') return true

  const perms = await getPermissions(role)
  return perms[module]?.[action] ?? false
}