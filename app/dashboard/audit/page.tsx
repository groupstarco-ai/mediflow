'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreModule, setFiltreModule] = useState('tous')
  const [filtreAction, setFiltreAction] = useState('tous')
  const [filtreDate, setFiltreDate] = useState('')
  const [logSelectionne, setLogSelectionne] = useState<any>(null)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      setLogs(data || [])
      setLoading(false)
    }
    charger()
  }, [])

  const logsFiltres = logs.filter(l => {
    const matchRecherche = `${l.utilisateur_email} ${l.action} ${l.details} ${l.module}`.toLowerCase().includes(recherche.toLowerCase())
    const matchModule = filtreModule === 'tous' || l.module === filtreModule
    const matchAction = filtreAction === 'tous' || l.action === filtreAction
    const matchDate = !filtreDate || l.created_at.startsWith(filtreDate)
    return matchRecherche && matchModule && matchAction && matchDate
  })

  const modules = ['tous', 'auth', 'patients', 'rendez_vous', 'dossiers', 'facturation']
  const actions = ['tous', 'connexion', 'creation', 'modification', 'suppression']

  const moduleConfig: any = {
    auth: { bg: 'bg-red-50', text: 'text-red-700', icone: '🔐' },
    patients: { bg: 'bg-blue-50', text: 'text-blue-700', icone: '👤' },
    rendez_vous: { bg: 'bg-green-50', text: 'text-green-700', icone: '📅' },
    dossiers: { bg: 'bg-purple-50', text: 'text-purple-700', icone: '📋' },
    utilisateurs: { bg: 'bg-slate-50', text: 'text-slate-600', icone: '👥' },
    facturation: { bg: 'bg-yellow-50', text: 'text-yellow-700', icone: '💰' },
  }

  const actionConfig: any = {
    creation: { couleur: 'text-green-600', bg: 'bg-green-50', icone: '✅' },
    modification: { couleur: 'text-yellow-600', bg: 'bg-yellow-50', icone: '✏️' },
    suppression: { couleur: 'text-red-600', bg: 'bg-red-50', icone: '🗑️' },
    connexion: { couleur: 'text-blue-600', bg: 'bg-blue-50', icone: '🔐' },
    deconnexion: { couleur: 'text-slate-500', bg: 'bg-slate-50', icone: '🚪' },
  }

  const stats = {
    total: logs.length,
    aujourd_hui: logs.filter(l => l.created_at.startsWith(new Date().toISOString().split('T')[0])).length,
    connexions: logs.filter(l => l.action === 'connexion').length,
    creations: logs.filter(l => l.action === 'creation').length,
    modifications: logs.filter(l => l.action === 'modification').length,
  }

  const exporterCSV = () => {
    const entetes = ['Date', 'Heure', 'Utilisateur', 'Module', 'Action', 'Détails']
    const lignes = logsFiltres.map(l => [
      new Date(l.created_at).toLocaleDateString('fr-FR'),
      new Date(l.created_at).toLocaleTimeString('fr-FR'),
      l.utilisateur_email,
      l.module,
      l.action,
      `"${l.details?.replace(/"/g, '""') || ''}"`
    ])
    const csv = [entetes, ...lignes].map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_mediflow_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Journal d'audit</h1>
            <p className="text-slate-500 text-sm mt-1">Traçabilité complète de toutes les actions</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-xl font-medium">
              {logsFiltres.length} action(s)
            </span>
            <button onClick={exporterCSV}
              className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-xl font-medium hover:bg-green-100 transition-colors">
              📥 Exporter CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">📊</div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">📅</div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.aujourd_hui}</p>
              <p className="text-xs text-slate-500">Aujourd'hui</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg">🔐</div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.connexions}</p>
              <p className="text-xs text-slate-500">Connexions</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-lg">✅</div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{stats.creations}</p>
              <p className="text-xs text-slate-500">Créations</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-lg">✏️</div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.modifications}</p>
              <p className="text-xs text-slate-500">Modifications</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 px-4 py-3 flex items-center gap-4 flex-wrap">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par utilisateur, action, détails..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 min-w-40"
          />
          <input
            type="date"
            value={filtreDate}
            onChange={(e) => setFiltreDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-800 text-slate-700"
          />
          {filtreDate && (
            <button onClick={() => setFiltreDate('')} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Module :</span>
            {modules.map((m) => {
              const c = moduleConfig[m]
              return (
                <button key={m} onClick={() => setFiltreModule(m)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filtreModule === m ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {m === 'tous' ? '📋 Tous' : `${c?.icone} ${m}`}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs text-slate-500">Action :</span>
            {actions.map((a) => {
              const c = actionConfig[a]
              return (
                <button key={a} onClick={() => setFiltreAction(a)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filtreAction === a ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {a === 'tous' ? 'Tous' : `${c?.icone} ${a}`}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-slate-400 text-sm">Chargement...</p>
            </div>
          ) : logsFiltres.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-400 text-sm">Aucune action trouvée.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date et heure</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilisateur</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Module</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Détails</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Voir</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltres.map((log) => {
                  const m = moduleConfig[log.module] || { bg: 'bg-slate-50', text: 'text-slate-600', icone: '📌' }
                  const a = actionConfig[log.action] || { couleur: 'text-slate-600', bg: 'bg-slate-50', icone: '📌' }
                  return (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{new Date(log.created_at).toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800 font-semibold text-xs">
                            {log.utilisateur_email?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-700 truncate max-w-32">{log.utilisateur_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${m.bg} ${m.text}`}>
                          {m.icone} {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${a.bg} ${a.couleur}`}>
                          {a.icone} {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{log.details}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => setLogSelectionne(log)}
                          className="text-xs text-blue-700 hover:underline">Détails →</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {logSelectionne && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Détails de l'action</h2>
                <button onClick={() => setLogSelectionne(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium">{new Date(logSelectionne.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Heure</span>
                  <span className="font-medium">{new Date(logSelectionne.created_at).toLocaleTimeString('fr-FR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Utilisateur</span>
                  <span className="font-medium">{logSelectionne.utilisateur_email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Module</span>
                  <span className="font-medium">{logSelectionne.module}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Action</span>
                  <span className="font-medium">{logSelectionne.action}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500 block mb-1">Détails complets</span>
                  <div className="bg-slate-50 rounded-xl p-3 text-slate-700 text-xs leading-relaxed">
                    {logSelectionne.details}
                  </div>
                </div>
              </div>
              <button onClick={() => setLogSelectionne(null)}
                className="mt-6 w-full bg-blue-800 text-white py-2.5 rounded-xl text-sm font-medium">
                Fermer
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}