'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'
import ProtegerPage from '../../components/ProtegerPage'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Statistiques() {
  const [loading, setLoading] = useState(true)
  const [statsRdv, setStatsRdv] = useState<any[]>([])
  const [statsDossiers, setStatsDossiers] = useState<any[]>([])
  const [statsPatients, setStatsPatients] = useState<any[]>([])
  const [totaux, setTotaux] = useState({
    patients: 0, rdvTotal: 0, rdvTermines: 0, rdvAnnules: 0,
    dossiers: 0, facturesTotal: 0, facturesPaye: 0,
  })

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: rdvs } = await supabase.from('rendez_vous').select('statut, date_heure')
      const { data: dossiers } = await supabase.from('dossiers_medicaux').select('niveau_confidentialite, date_consultation')
      const { data: patients } = await supabase.from('patients').select('sexe, created_at')
      const { data: factures } = await supabase.from('factures').select('statut, montant')
      if (rdvs) {
        const parMois: any = {}
        rdvs.forEach(r => {
          const mois = new Date(r.date_heure).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
          parMois[mois] = (parMois[mois] || 0) + 1
        })
        setStatsRdv(Object.entries(parMois).map(([mois, total]) => ({ mois, total })).slice(-6))
        setTotaux(t => ({ ...t, rdvTotal: rdvs.length, rdvTermines: rdvs.filter(r => r.statut === 'termine').length, rdvAnnules: rdvs.filter(r => r.statut === 'annule').length }))
      }
      if (dossiers) {
        setStatsDossiers([
          { name: 'Standard', value: dossiers.filter(d => d.niveau_confidentialite === 1).length, couleur: '#22c55e' },
          { name: 'Confidentiel', value: dossiers.filter(d => d.niveau_confidentialite === 2).length, couleur: '#ef4444' },
        ])
        setTotaux(t => ({ ...t, dossiers: dossiers.length }))
      }
      if (patients) {
        setStatsPatients([
          { name: 'Hommes', value: patients.filter(p => p.sexe === 'homme').length, couleur: '#3b82f6' },
          { name: 'Femmes', value: patients.filter(p => p.sexe === 'femme').length, couleur: '#ec4899' },
          { name: 'Non renseigné', value: patients.filter(p => !p.sexe).length, couleur: '#94a3b8' },
        ])
        setTotaux(t => ({ ...t, patients: patients.length }))
      }
      if (factures) {
        const totalPaye = factures.filter(f => f.statut === 'paye').reduce((acc, f) => acc + f.montant, 0)
        setTotaux(t => ({ ...t, facturesTotal: factures.length, facturesPaye: totalPaye }))
      }
      setLoading(false)
    }
    charger()
  }, [])

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6"><p className="text-slate-400">Chargement des statistiques...</p></main>
    </div>
  )

  return (
    <ProtegerPage module="statistiques">
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 px-8 py-6">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
            <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de l'activité de votre structure</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl p-5 shadow-sm">
              <p className="text-blue-100 text-sm mb-1">Patients</p>
              <p className="text-3xl font-bold text-white">{totaux.patients}</p>
              <p className="text-blue-200 text-xs mt-1">Total enregistrés</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-slate-500 text-sm mb-1">RDV total</p>
              <p className="text-3xl font-bold text-slate-900">{totaux.rdvTotal}</p>
              <p className="text-xs text-green-600 mt-1">{totaux.rdvTermines} terminés</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-slate-500 text-sm mb-1">Dossiers médicaux</p>
              <p className="text-3xl font-bold text-slate-900">{totaux.dossiers}</p>
              <p className="text-xs text-slate-400 mt-1">Consultations enregistrées</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-5 shadow-sm">
              <p className="text-green-100 text-sm mb-1">Revenus encaissés</p>
              <p className="text-2xl font-bold text-white">{totaux.facturesPaye.toLocaleString()}</p>
              <p className="text-green-200 text-xs mt-1">FCFA</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4">RDV par mois</h2>
              {statsRdv.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune donnée disponible.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statsRdv}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Répartition des patients</h2>
              {statsPatients.every(s => s.value === 0) ? (
                <p className="text-slate-400 text-sm">Aucune donnée disponible.</p>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie data={statsPatients} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {statsPatients.map((entry, index) => (
                          <Cell key={index} fill={entry.couleur} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2">
                    {statsPatients.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: s.couleur }}></div>
                        <span className="text-sm text-slate-600">{s.name}</span>
                        <span className="text-sm font-semibold text-slate-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Dossiers par confidentialité</h2>
              {statsDossiers.every(s => s.value === 0) ? (
                <p className="text-slate-400 text-sm">Aucune donnée disponible.</p>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie data={statsDossiers} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {statsDossiers.map((entry, index) => (
                          <Cell key={index} fill={entry.couleur} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2">
                    {statsDossiers.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: s.couleur }}></div>
                        <span className="text-sm text-slate-600">{s.name}</span>
                        <span className="text-sm font-semibold text-slate-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Résumé financier</h2>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="text-sm text-green-700 font-medium">Factures payées</span>
                  <span className="text-sm font-bold text-green-700">{totaux.facturesPaye.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600 font-medium">Total factures</span>
                  <span className="text-sm font-bold text-slate-800">{totaux.facturesTotal}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-sm text-red-700 font-medium">RDV annulés</span>
                  <span className="text-sm font-bold text-red-700">{totaux.rdvAnnules}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-blue-700 font-medium">Taux de complétion</span>
                  <span className="text-sm font-bold text-blue-700">
                    {totaux.rdvTotal > 0 ? Math.round((totaux.rdvTermines / totaux.rdvTotal) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </ProtegerPage>
  )
}