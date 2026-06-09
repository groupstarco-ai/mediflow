'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function RendezVous() {
  const [rdvs, setRdvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getRdvs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      const { data } = await supabase
        .from('rendez_vous')
        .select('*, patients(nom, prenom), medecins(nom, prenom)')
        .order('date_heure', { ascending: true })
      setRdvs(data || [])
      setLoading(false)
    }
    getRdvs()
  }, [])

  const statutCouleur = (statut: string) => {
    switch (statut) {
      case 'confirme': return 'bg-green-50 text-green-700'
      case 'planifie': return 'bg-blue-50 text-blue-700'
      case 'en_cours': return 'bg-yellow-50 text-yellow-700'
      case 'termine': return 'bg-slate-50 text-slate-600'
      case 'annule': return 'bg-red-50 text-red-700'
      case 'absent': return 'bg-orange-50 text-orange-700'
      default: return 'bg-slate-50 text-slate-600'
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rendez-vous</h1>
            <p className="text-slate-500 text-sm mt-1">{rdvs.length} rendez-vous au total</p>
          </div>
          
          <a href="/dashboard/rendez-vous/nouveau"
            className="bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            + Nouveau RDV
          </a>
        </div>

        <div className="bg-white rounded-xl border border-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
          ) : rdvs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm mb-4">Aucun rendez-vous pour le moment.</p>
              
               <a href="/dashboard/rendez-vous/nouveau"
                className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Créer le premier RDV
              </a>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Patient</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Médecin</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Date et heure</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Motif</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody>
                {rdvs.map((rdv) => (
                  <tr key={rdv.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {rdv.patients?.prenom} {rdv.patients?.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      Dr. {rdv.medecins?.prenom} {rdv.medecins?.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(rdv.date_heure).toLocaleDateString('fr-FR')} à {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{rdv.motif}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statutCouleur(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
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