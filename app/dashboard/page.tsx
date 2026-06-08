'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-800 rounded-lg"></div>
          <span className="font-semibold text-slate-800 text-lg">MediFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user?.email}</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="text-sm text-red-600 border border-red-100 px-3 py-1.5 rounded-lg"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mb-8">Bienvenue sur MediFlow</p>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">RDV aujourd'hui</p>
            <p className="text-3xl font-bold text-slate-900">0</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">Patients actifs</p>
            <p className="text-3xl font-bold text-slate-900">0</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">En attente</p>
            <p className="text-3xl font-bold text-slate-900">0</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">Annulations</p>
            <p className="text-3xl font-bold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Prochains rendez-vous</h2>
          <p className="text-slate-400 text-sm">Aucun rendez-vous pour le moment.</p>
        </div>
      </div>

    </main>
  )
}