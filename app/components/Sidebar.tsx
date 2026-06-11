'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserRole, getPermissions } from '@/lib/permissions'

export default function Sidebar() {
  const [pathname, setPathname] = useState('')
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('')
  const [permissions, setPermissions] = useState<any>({})

  useEffect(() => {
    setPathname(window.location.pathname)
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const r = await getUserRole()
      if (r) {
        setRole(r)
        if (r !== 'administrateur') {
          const perms = await getPermissions(r)
          setPermissions(perms)
        }
      }
    }
    init()

    let timer: ReturnType<typeof setTimeout>
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
      }, 30 * 60 * 1000)
    }
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [])

  const peutVoir = (module: string) => {
    if (role === 'administrateur') return true
    return permissions[module]?.peut_voir ?? false
  }

  const roleConfig: any = {
    administrateur: { label: 'Administrateur', couleur: 'text-blue-300', icone: '🛡️' },
    medecin: { label: 'Médecin', couleur: 'text-green-300', icone: '🩺' },
    infirmier: { label: 'Infirmier', couleur: 'text-purple-300', icone: '💉' },
    gestionnaire: { label: 'Gestionnaire', couleur: 'text-yellow-300', icone: '📋' },
    patient: { label: 'Patient', couleur: 'text-slate-300', icone: '👤' },
  }

  const menus = [
    { nom: 'Tableau de bord', icone: '📊', lien: '/dashboard', module: 'dashboard' },
    { nom: 'Patients', icone: '👤', lien: '/dashboard/patients', module: 'patients' },
    { nom: 'Rendez-vous', icone: '📅', lien: '/dashboard/rendez-vous', module: 'rendez_vous' },
    { nom: 'Médecins', icone: '🩺', lien: '/dashboard/medecins', module: 'medecins' },
    { nom: 'Dossiers médicaux', icone: '📋', lien: '/dashboard/dossiers', module: 'dossiers' },
    { nom: 'Facturation', icone: '💰', lien: '/dashboard/facturation', module: 'facturation' },
    { nom: 'Statistiques', icone: '📈', lien: '/dashboard/statistiques', module: 'statistiques' },
   { nom: 'Journal d\'audit', icone: '🔍', lien: '/dashboard/audit', module: 'parametres' },
    { nom: 'Paramètres', icone: '⚙️', lien: '/dashboard/parametres', module: 'parametres' },
  ]

  const menusFiltres = menus.filter(m => {
    if (m.module === 'dashboard' || m.module === 'audit') return true
    return peutVoir(m.module)
  })

  const rc = roleConfig[role] || roleConfig.gestionnaire

  return (
    <aside className="w-60 min-h-screen bg-blue-950 flex flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-blue-800 rounded-md"></div>
        </div>
        <div>
          <div className="font-bold text-white text-lg leading-none">MediFlow</div>
          <div className="text-blue-300 text-xs mt-0.5">Gestion médicale</div>
        </div>
      </div>
      <div className="px-3 mb-4">
        <div className="h-px bg-blue-800"></div>
      </div>
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {menusFiltres.map((item) => (
          <a key={item.lien}
            href={item.lien}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              pathname === item.lien
                ? 'bg-blue-700 text-white font-medium shadow-sm'
                : 'text-blue-200 hover:bg-blue-900 hover:text-white'
            }`}
          >
            <span className="text-base">{item.icone}</span>
            <span>{item.nom}</span>
          </a>
        ))}
      </nav>
      <div className="px-3 mb-3">
        <div className="h-px bg-blue-800"></div>
      </div>
      <div className="px-3 pb-4">
        <div className="bg-blue-900 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span>{rc.icone}</span>
            <span className={`text-xs font-medium ${rc.couleur}`}>{rc.label}</span>
          </div>
          <p className="text-xs text-blue-300 mb-0.5">Connecté en tant que</p>
          <p className="text-sm text-white font-medium truncate">{user?.email}</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-900 hover:text-red-100 w-full transition-all"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}