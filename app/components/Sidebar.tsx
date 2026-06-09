'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  useEffect(() => {
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

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-slate-100 flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-800 rounded-lg"></div>
        <span className="font-semibold text-slate-800">MediFlow</span>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <span>📊</span><span>Tableau de bord</span>
        </a>
        <a href="/dashboard/patients" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <span>👤</span><span>Patients</span>
        </a>
        <a href="/dashboard/rendez-vous" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <span>📅</span><span>Rendez-vous</span>
        </a>
        <a href="/dashboard/medecins" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <span>🩺</span><span>Médecins</span>
        </a>
        <a href="/dashboard/dossiers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <span>📋</span><span>Dossiers médicaux</span>
        </a>
        <a href="/dashboard/facturation" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <span>💰</span><span>Facturation</span>
        </a>
        <a href="/dashboard/parametres" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <span>⚙️</span><span>Paramètres</span>
        </a>
      </nav>
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full"
        >
          <span>🚪</span><span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}