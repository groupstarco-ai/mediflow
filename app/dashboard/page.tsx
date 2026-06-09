'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    patients: 0,
    rdvAujourdhui: 0,
    rdvEnAttente: 0,
    rdvAnnules: 0,
  })
  const [rdvs, setRdvs] = useState<any[]>([])
  const [heure, setHeure] = useState('')

  useEffect(() => {
    const now = new Date()
    const h = now.getHours()
    if (h < 12) setHeure('Bonjour')
    else if (h < 18) setHeure('Bon après-midi')
    else setHeure('Bonsoir')

    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const aujourd_hui = new Date().toISOString().split('T')[0]

      const { count: totalPatients } = await supabase
        .from('patients').select('*', { count: 'exact', head: true })

      const { count: rdvAujourdhui } = await supabase
        .from('rendez_vous').select('*', { count: 'exact', head: true })
        .gte('date_heure', `${aujourd_hui}T00:00:00`)
        .lte('date_heure', `${aujourd_hui}T23:59:59`)

      const { count: rdvEnAttente } = await supabase
        .from('rendez_vous').select('*', { count: 'exact', head: true })
        .eq('statut', 'planifie')

      const { count: rdvAnnules } = await supabase
        .from('rendez_vous').select('*', { count: 'exact', head: true })
        .eq('statut', 'annule')

      const { data: prochains } = await supabase
        .from('rendez_vous')
        .select('*, patients(nom, prenom)')
        .gte('date_heure', new Date().toISOString())
        .order('date_heure', { ascending: true })
        .limit(5)

      setStats({
        patients: totalPatients || 0,
        rdvAujourdhui: rdvAujourdhui || 0,
        rdvEnAttente: rdvEnAttente || 0,
        rdvAnnules: rdvAnnules || 0,
      })
      setRdvs(prochains || [])
    }
    charger()
  }, [])

  const aujourd_hui = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {heure}, {user?.email?.split('@')[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1 capitalize">{aujourd_hui}</p>
          </div>
          <a href="/dashboard/rendez-vous/nouveau"
            className="bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
            + Nouveau RDV
          </a>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">Patients actifs</p>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.patients}</p>
            <p className="text-xs text-slate-400 mt-1">Total enregistrés</p>
          </div>
          <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-blue-100">RDV aujourd'hui</p>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.rdvAujourdhui}</p>
            <p className="text-xs text-blue-200 mt-1">Consultations prévues</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">En attente</p>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.rdvEnAttente}</p>
            <p className="text-xs text-slate-400 mt-1">À confirmer</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">Annulations</p>
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-3xl font-bold text-red-500">{stats.rdvAnnules}</p>
            <p className="text-xs text-slate-400 mt-1">Ce mois</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800">Prochains rendez-vous</h2>
              <a href="/dashboard/rendez-vous" className="text-blue-800 text-sm hover:underline">Voir tout →</a>
            </div>
            {rdvs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-slate-400 text-sm">Aucun rendez-vous à venir.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rdvs.map((rdv) => (
                  <div key={rdv.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-800 font-semibold text-sm flex-shrink-0">
                      {rdv.patients?.prenom?.[0]}{rdv.patients?.nom?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{rdv.patients?.prenom} {rdv.patients?.nom}</p>
                      <p className="text-xs text-slate-400">{rdv.motif}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-700">
                        {new Date(rdv.date_heure).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{rdv.statut}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-5">Accès rapide</h2>
            <div className="flex flex-col gap-3">
              <a href="/dashboard/patients/nouveau"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <span className="text-xl">👤</span>
                <span className="text-sm font-medium text-slate-700">Nouveau patient</span>
              </a>
              <a href="/dashboard/rendez-vous/nouveau"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <span className="text-xl">📅</span>
                <span className="text-sm font-medium text-slate-700">Nouveau RDV</span>
              </a>
              <a href="/dashboard/dossiers/nouveau"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <span className="text-xl">📋</span>
                <span className="text-sm font-medium text-slate-700">Nouveau dossier</span>
              </a>
              <a href="/dashboard/facturation"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <span className="text-xl">💰</span>
                <span className="text-sm font-medium text-slate-700">Facturation</span>
              </a>
              <a href="/dashboard/audit"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <span className="text-xl">🔍</span>
                <span className="text-sm font-medium text-slate-700">Journal d'audit</span>
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}