'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Dossiers() {
  const [dossiers, setDossiers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getDossiers = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase
        .from('dossiers_medicaux')
        .select('*, patients(nom, prenom), medecins(nom, prenom)')
        .order('date_consultation', { ascending: false })
      setDossiers(data || [])
      setLoading(false)
    }
    getDossiers()
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dossiers médicaux</h1>
            <p className="text-slate-500 text-sm mt-1">{dossiers.length} dossier(s)</p>
          </div>
          <a href="/dashboard/dossiers/nouveau"
            className="bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
            + Nouveau dossier
          </a>
        </div>

        <div className="bg-white rounded-xl border border-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
          ) : dossiers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Aucun dossier médical.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Patient</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Médecin</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Diagnostic</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Confidentialité</th>
                </tr>
              </thead>
              <tbody>
                {dossiers.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {d.patients?.prenom} {d.patients?.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      Dr. {d.medecins?.prenom} {d.medecins?.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(d.date_consultation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {d.niveau_confidentialite === 2 ? (
                        <span className="text-red-400 italic">Confidentiel</span>
                      ) : (
                        d.diagnostic
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {d.niveau_confidentialite === 1 ? (
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Standard</span>
                      ) : (
                        <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Confidentiel</span>
                      )}
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