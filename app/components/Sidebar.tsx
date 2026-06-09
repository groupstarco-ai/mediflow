'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const [pathname, setPathname] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setPathname(window.location.pathname)
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

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

  const menus = [
    { nom: 'Tableau de bord', icone: '📊', lien: '/dashboard' },
    { nom: 'Patients', icone: '👤', lien: '/dashboard/patients' },
    { nom: 'Rendez-vous', icone: '📅', lien: '/dashboard/rendez-vous' },
    { nom: 'Médecins', icone: '🩺', lien: '/dashboard/medecins' },
    { nom: 'Dossiers médicaux', icone: '📋', lien: '/dashboard/dossiers' },
    { nom: 'Facturation', icone: '💰', lien: '/dashboard/facturation' },
    { nom: 'Journal d\'audit', icone: '🔍', lien: '/dashboard/audit' },
    { nom: 'Paramètres', icone: '⚙️', lien: '/dashboard/parametres' },
  ]

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
        {menus.map((item) => (
          
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