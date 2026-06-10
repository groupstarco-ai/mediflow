'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function RendezVous() {
  const [rdvs, setRdvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')

  const chargerRdvs = async () => {
    const { data } = await supabase
      .from('rendez_vous')
      .select('*, patients(nom, prenom), medecins(nom, prenom)')
      .order('date_heure', { ascending: true })

    if (data) {
      const statutOrdre: any = { en_cours: 0, confirme: 1, planifie: 2, absent: 3, annule: 4, termine: 5 }
      const prioriteOrdre: any = { urgent: 0, normal: 1, suivi: 2 }
      const trie = [...data].sort((a, b) => {
        const statutA = statutOrdre[a.statut] ?? 3
        const statutB = statutOrdre[b.statut] ?? 3
        if (statutA !== statutB) return statutA - statutB
        const prioriteA = prioriteOrdre[a.priorite] ?? 1
        const prioriteB = prioriteOrdre[b.priorite] ?? 1
        if (prioriteA !== prioriteB) return prioriteA - prioriteB
        return new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime()
      })
      setRdvs(trie)
    }
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      chargerRdvs()
    }
    init()
  }, [])

  const changerStatut = async (id: string, nouveauStatut: string) => {
    await supabase.from('rendez_vous').update({ statut: nouveauStatut }).eq('id', id)
    chargerRdvs()
  }

  const rdvFiltres = rdvs.filter(r => {
    const matchRecherche = `${r.patients?.prenom} ${r.patients?.nom} ${r.motif}`.toLowerCase().includes(recherche.toLowerCase())
    const matchFiltre = filtre === 'tous' || r.statut === filtre
    return matchRecherche && matchFiltre
  })

  const statutConfig: any = {
    planifie: { label: 'Planifié', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
    confirme: { label: 'Confirmé', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
    en_cours: { label: 'En cours', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
    termine: { label: 'Terminé', bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
    annule: { label: 'Annulé', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
    absent: { label: 'Absent', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  }

  const prioriteConfig: any = {
    urgent: { label: '🚨 Urgent', bg: 'bg-red-50', text: 'text-red-700' },
    normal: { label: '📅 Normal', bg: 'bg-blue-50', text: 'text-blue-600' },
    suivi: { label: '🔄 Suivi', bg: 'bg-green-50', text: 'text-green-700' },
  }

  const actionsParStatut: any = {
    planifie: [
      { label: '✅ Confirmer', statut: 'confirme', style: 'bg-green-50 text-green-700 hover:bg-green-100' },
      { label: '❌ Annuler', statut: 'annule', style: 'bg-red-50 text-red-700 hover:bg-red-100' },
    ],
    confirme: [
      { label: '▶️ Démarrer', statut: 'en_cours', style: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
      { label: '❌ Annuler', statut: 'annule', style: 'bg-red-50 text-red-700 hover:bg-red-100' },
      { label: '🚶 Absent', statut: 'absent', style: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
    ],
    en_cours: [
      { label: '🏁 Terminer', statut: 'termine', style: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
    ],
    termine: [],
    annule: [
      { label: '🔄 Replanifier', statut: 'planifie', style: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    ],
    absent: [
      { label: '🔄 Replanifier', statut: 'planifie', style: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    ],
  }

  const stats = {
    total: rdvs.length,
    urgent: rdvs.filter(r => r.priorite === 'urgent' && !['termine', 'annule'].includes(r.statut)).length,
    planifie: rdvs.filter(r => r.statut === 'planifie').length,
    confirme: rdvs.filter(r => r.statut === 'confirme').length,
    termine: rdvs.filter(r => r.statut === 'termine').length,
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rendez-vous</h1>
            <p className="text-slate-500 text-sm mt-1">{rdvs.length} rendez-vous au total</p>
          </div>
          <a href="/dashboard/rendez-vous/nouveau"
            className="bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
            + Nouveau RDV
          </a>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">📅</div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">🚨</div>
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.urgent}</p>
              <p className="text-xs text-red-500">Urgents</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">⏰</div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.planifie}</p>
              <p className="text-xs text-slate-500">Planifiés</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg">✅</div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.confirme}</p>
              <p className="text-xs text-slate-500">Confirmés</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">🏁</div>
            <div>
              <p className="text-2xl font-bold text-slate-700">{stats.termine}</p>
              <p className="text-xs text-slate-500">Terminés</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 px-4 py-3 flex items-center gap-4">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par patient ou motif..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
          <div className="flex gap-2">
            {['tous', 'planifie', 'confirme', 'en_cours', 'termine', 'annule'].map((s) => (
              <button key={s} onClick={() => setFiltre(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filtre === s ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {s === 'tous' ? 'Tous' : statutConfig[s]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-slate-400 text-sm">Chargement...</p>
            </div>
          ) : rdvFiltres.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-400 text-sm">Aucun rendez-vous trouvé.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Médecin</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date et heure</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Motif</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Priorité</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rdvFiltres.map((rdv) => {
                  const s = statutConfig[rdv.statut] || statutConfig.planifie
                  const p = prioriteConfig[rdv.priorite] || prioriteConfig.normal
                  const actions = actionsParStatut[rdv.statut] || []
                  const estTermine = ['termine', 'annule'].includes(rdv.statut)
                  return (
                    <tr key={rdv.id} className={`border-b border-slate-50 transition-colors ${
                      estTermine ? 'opacity-50 bg-slate-50' : rdv.priorite === 'urgent' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-blue-50'
                    }`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-800 font-semibold text-sm flex-shrink-0">
                            {rdv.patients?.prenom?.[0]}{rdv.patients?.nom?.[0]}
                          </div>
                          <p className="text-sm font-medium text-slate-800">
                            {rdv.patients?.prenom} {rdv.patients?.nom}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        Dr. {rdv.medecins?.prenom} {rdv.medecins?.nom}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(rdv.date_heure).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{rdv.motif || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${p.bg} ${p.text}`}>
                          {p.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap items-center">
                          {actions.map((action: any) => (
                            <button
                              key={action.statut}
                              onClick={() => changerStatut(rdv.id, action.statut)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${action.style}`}
                            >
                              {action.label}
                            </button>
                          ))}
                          <a href={`/dashboard/rendez-vous/${rdv.id}/modifier`}
                            className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                            ✏️ Modifier
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  )
}