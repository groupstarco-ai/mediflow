'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      const { data } = await supabase.from('patients').select('*')
      setPatients(data || [])
      setLoading(false)
    }
    getPatients()
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
            <p className="text-slate-500 text-sm mt-1">{patients.length} patient(s) enregistré(s)</p>
          </div>
          
           <a href="/dashboard/patients/nouveau"
            className="bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            + Nouveau patient
          </a>
        </div>

        <div className="bg-white rounded-xl border border-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm mb-4">Aucun patient enregistré pour le moment.</p>
              
              <a href="/dashboard/patients/nouveau"
                className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Créer le premier patient
              </a>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Nom</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Téléphone</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Date de naissance</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Confidentialité</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {patient.prenom} {patient.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{patient.telephone}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{patient.date_naissance}</td>
                    <td className="px-6 py-4">
                      {patient.niveau_confidentialite === 1 ? (
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Standard</span>
                      ) : (
                        <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Confidentiel</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/dashboard/patients/${patient.id}`} className="text-blue-800 text-sm">
                        Voir
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