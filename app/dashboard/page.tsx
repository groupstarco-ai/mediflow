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

  useEffect(() => {
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mb-8">Bienvenue, {user?.email}</p>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">Patients actifs</p>
            <p className="text-3xl font-bold text-slate-900">{stats.patients}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">RDV aujourd'hui</p>
            <p className="text-3xl font-bold text-blue-800">{stats.rdvAujourdhui}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">En attente</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.rdvEnAttente}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">Annulations</p>
            <p className="text-3xl font-bold text-red-600">{stats.rdvAnnules}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Prochains rendez-vous</h2>
            <a href="/dashboard/rendez-vous" className="text-blue-800 text-sm">Voir tout</a>
          </div>
          {rdvs.length === 0 ? (
            <p className="text-slate-400 text-sm">Aucun rendez-vous à venir.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">Patient</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">Date et heure</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">Motif</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody>
                {rdvs.map((rdv) => (
                  <tr key={rdv.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {rdv.patients?.prenom} {rdv.patients?.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(rdv.date_heure).toLocaleDateString('fr-FR')} à {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{rdv.motif}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{rdv.statut}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}