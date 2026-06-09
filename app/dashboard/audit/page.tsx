'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      setLogs(data || [])
      setLoading(false)
    }
    charger()
  }, [])

  const moduleCouleur = (module: string) => {
    switch (module) {
      case 'patients': return 'bg-blue-50 text-blue-700'
      case 'rendez_vous': return 'bg-green-50 text-green-700'
      case 'dossiers': return 'bg-purple-50 text-purple-700'
      case 'facturation': return 'bg-yellow-50 text-yellow-700'
      case 'auth': return 'bg-red-50 text-red-700'
      case 'utilisateurs': return 'bg-slate-50 text-slate-600'
      default: return 'bg-slate-50 text-slate-600'
    }
  }

  const actionCouleur = (action: string) => {
    if (action.includes('creation')) return 'text-green-600'
    if (action.includes('modification')) return 'text-yellow-600'
    if (action.includes('suppression')) return 'text-red-600'
    if (action.includes('connexion')) return 'text-blue-600'
    if (action.includes('deconnexion')) return 'text-slate-500'
    return 'text-slate-600'
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Journal d'audit</h1>
            <p className="text-slate-500 text-sm mt-1">Traçabilité complète de toutes les actions</p>
          </div>
          <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-lg">
            {logs.length} action(s) enregistrée(s)
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Aucune action enregistrée pour le moment.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Date et heure</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Utilisateur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Module</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Action</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(log.created_at).toLocaleDateString('fr-FR')} à {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.utilisateur_email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${moduleCouleur(log.module)}`}>{log.module}</span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${actionCouleur(log.action)}`}>{log.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{log.details}</td>
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