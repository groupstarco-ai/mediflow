'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../components/Sidebar'

export default function DetailPatient({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<any>(null)
  const [dossiers, setDossiers] = useState<any[]>([])
  const [rdvs, setRdvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: p } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .single()
      setPatient(p)

      const { data: d } = await supabase
        .from('dossiers_medicaux')
        .select('*, medecins(nom, prenom)')
        .eq('patient_id', params.id)
        .order('date_consultation', { ascending: false })
      setDossiers(d || [])

      const { data: r } = await supabase
        .from('rendez_vous')
        .select('*, medecins(nom, prenom)')
        .eq('patient_id', params.id)
        .order('date_heure', { ascending: false })
      setRdvs(r || [])

      setLoading(false)
    }
    charger()
  }, [params.id])

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <p className="text-slate-400">Chargement...</p>
      </main>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center gap-4 mb-8">
          <a href="/dashboard/patients" className="text-slate-400 hover:text-slate-600 text-sm">
            Patients
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 text-sm font-medium">{patient?.prenom} {patient?.nom}</span>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-1 bg-white rounded-xl border border-slate-100 p-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-800">
                {patient?.prenom?.[0]}{patient?.nom?.[0]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{patient?.prenom} {patient?.nom}</h1>
            <p className="text-slate-500 text-sm mt-1">{patient?.telephone}</p>
            <p className="text-slate-500 text-sm">{patient?.email}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date de naissance</span>
                <span className="text-slate-800">{patient?.date_naissance || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sexe</span>
                <span className="text-slate-800">{patient?.sexe || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Groupe sanguin</span>
                <span className="text-slate-800 font-medium">{patient?.groupe_sanguin || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Confidentialité</span>
                {patient?.niveau_confidentialite === 1 ? (
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Standard</span>
                ) : (
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Confidentiel</span>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Dossiers médicaux</h2>
                <a href="/dashboard/dossiers/nouveau" className="text-blue-800 text-sm">+ Nouveau</a>
              </div>
              {dossiers.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun dossier médical.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dossiers.map((d) => (
                    <div key={d.id} className="border border-slate-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-800">
                          {new Date(d.date_consultation).toLocaleDateString('fr-FR')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Dr. {d.medecins?.prenom} {d.medecins?.nom}</span>
                          {d.niveau_confidentialite === 2 ? (
                            <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Confidentiel</span>
                          ) : (
                            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Standard</span>
                          )}
                        </div>
                      </div>
                      {d.niveau_confidentialite === 2 ? (
                        <p className="text-red-400 text-sm italic">Dossier confidentiel — accès restreint</p>
                      ) : (
                        <>
                          <p className="text-sm text-slate-700"><span className="font-medium">Diagnostic :</span> {d.diagnostic}</p>
                          {d.traitement && <p className="text-sm text-slate-500 mt-1"><span className="font-medium">Traitement :</span> {d.traitement}</p>}
                          {d.ordonnance && <p className="text-sm text-slate-500 mt-1"><span className="font-medium">Ordonnance :</span> {d.ordonnance}</p>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Rendez-vous</h2>
                <a href="/dashboard/rendez-vous/nouveau" className="text-blue-800 text-sm">+ Nouveau</a>
              </div>
              {rdvs.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun rendez-vous.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {rdvs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between border border-slate-100 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(r.date_heure).toLocaleDateString('fr-FR')} à {new Date(r.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-slate-500">{r.motif}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{r.statut}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}