'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    const getPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false })
      setPatients(data || [])
      setLoading(false)
    }
    getPatients()
  }, [])

  const patientsFiltres = patients.filter(p =>
    `${p.prenom} ${p.nom} ${p.telephone}`.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
            <p className="text-slate-500 text-sm mt-1">{patients.length} patient(s) enregistré(s)</p>
          </div>
          <a href="/dashboard/patients/nouveau"
            className="bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
            + Nouveau patient
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un patient par nom ou téléphone..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
          {recherche && (
            <button onClick={() => setRecherche('')} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-slate-400 text-sm">Chargement des patients...</p>
            </div>
          ) : patientsFiltres.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-slate-400 text-sm mb-4">
                {recherche ? 'Aucun patient trouvé pour cette recherche.' : 'Aucun patient enregistré.'}
              </p>
              {!recherche && (
                <a href="/dashboard/patients/nouveau"
                  className="bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-medium">
                  Créer le premier patient
                </a>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Téléphone</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sexe</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Groupe</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Confidentialité</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientsFiltres.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-50 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-800 font-semibold text-sm flex-shrink-0">
                          {patient.prenom?.[0]}{patient.nom?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{patient.prenom} {patient.nom}</p>
                          <p className="text-xs text-slate-400">{patient.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.telephone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{patient.sexe || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-lg font-medium">
                        {patient.groupe_sanguin || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {patient.niveau_confidentialite === 1 ? (
                        <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium">✓ Standard</span>
                      ) : (
                        <span className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full font-medium">🔒 Confidentiel</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/dashboard/patients/${patient.id}`}
                        className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                        Voir le dossier →
                      </a>
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