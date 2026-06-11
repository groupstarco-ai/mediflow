'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'
import { getUserRole } from '@/lib/permissions'

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [role, setRole] = useState<string>('')
  const [patientConstantes, setPatientConstantes] = useState<string | null>(null)
  const [formConstantes, setFormConstantes] = useState({
    poids: '', taille: '', tension_systolique: '', tension_diastolique: '',
    temperature: '', pouls: '', saturation: '', glycemie: '', observations: '',
  })
  const [saving, setSaving] = useState(false)
  const [succes, setSucces] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const r = await getUserRole()
      setRole(r || '')
      const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false })
      setPatients(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const patientsFiltres = patients.filter(p =>
    `${p.prenom} ${p.nom} ${p.telephone}`.toLowerCase().includes(recherche.toLowerCase())
  )

  const handleConstantesChange = (e: any) => {
    setFormConstantes({ ...formConstantes, [e.target.name]: e.target.value })
  }

  const sauvegarderConstantes = async () => {
    if (!patientConstantes) return
    setSaving(true)
    await supabase.from('constantes_vitales').insert([{
      patient_id: patientConstantes,
      poids: formConstantes.poids ? parseFloat(formConstantes.poids) : null,
      taille: formConstantes.taille ? parseFloat(formConstantes.taille) : null,
      tension_systolique: formConstantes.tension_systolique ? parseInt(formConstantes.tension_systolique) : null,
      tension_diastolique: formConstantes.tension_diastolique ? parseInt(formConstantes.tension_diastolique) : null,
      temperature: formConstantes.temperature ? parseFloat(formConstantes.temperature) : null,
      pouls: formConstantes.pouls ? parseInt(formConstantes.pouls) : null,
      saturation: formConstantes.saturation ? parseInt(formConstantes.saturation) : null,
      glycemie: formConstantes.glycemie ? parseFloat(formConstantes.glycemie) : null,
      observations: formConstantes.observations,
    }])
    setSucces(true)
    setSaving(false)
    setFormConstantes({ poids: '', taille: '', tension_systolique: '', tension_diastolique: '', temperature: '', pouls: '', saturation: '', glycemie: '', observations: '' })
    setTimeout(() => { setSucces(false); setPatientConstantes(null) }, 2000)
  }

  const patientSelectionne = patients.find(p => p.id === patientConstantes)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
            <p className="text-slate-500 text-sm mt-1">{patients.length} patient(s) enregistré(s)</p>
          </div>
          {role !== 'infirmier' && (
            <div className="flex gap-3">
              {role === 'gestionnaire' && (
                <a href="/dashboard/rendez-vous/nouveau"
                  className="border border-blue-200 text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                  📅 Nouveau RDV
                </a>
              )}
              <a href="/dashboard/patients/nouveau"
                className="bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
                + Nouveau patient
              </a>
            </div>
          )}
        </div>

        {role === 'infirmier' && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">💉</span>
            <div>
              <p className="text-sm font-semibold text-purple-800">Mode Infirmier</p>
              <p className="text-xs text-purple-600">Cliquez sur "Prendre les constantes" pour saisir les mesures d'un patient</p>
            </div>
          </div>
        )}

        {role === 'gestionnaire' && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <a href="/dashboard/patients/nouveau"
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Nouveau patient</p>
                <p className="text-xs text-slate-500">Enregistrer un patient</p>
              </div>
            </a>
            <a href="/dashboard/rendez-vous/nouveau"
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">📅</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Nouveau RDV</p>
                <p className="text-xs text-slate-500">Planifier un rendez-vous</p>
              </div>
            </a>
            <a href="/dashboard/facturation"
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-xl">💰</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Facturation</p>
                <p className="text-xs text-slate-500">Gérer les paiements</p>
              </div>
            </a>
          </div>
        )}

        {patientConstantes && (
          <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-800 font-bold">
                  {patientSelectionne?.prenom?.[0]}{patientSelectionne?.nom?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{patientSelectionne?.prenom} {patientSelectionne?.nom}</p>
                  <p className="text-xs text-purple-600">Saisie des constantes vitales</p>
                </div>
              </div>
              <button onClick={() => setPatientConstantes(null)}
                className="text-slate-400 hover:text-slate-600 text-sm">✕ Fermer</button>
            </div>
            {succes && (
              <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
                ✅ Constantes enregistrées avec succès !
              </div>
            )}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Poids (kg)</label>
                <input name="poids" value={formConstantes.poids} onChange={handleConstantesChange} type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="70" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Taille (cm)</label>
                <input name="taille" value={formConstantes.taille} onChange={handleConstantesChange} type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="170" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Température (°C)</label>
                <input name="temperature" value={formConstantes.temperature} onChange={handleConstantesChange} type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="37.5" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tension sys/dia</label>
                <div className="flex gap-1">
                  <input name="tension_systolique" value={formConstantes.tension_systolique} onChange={handleConstantesChange} type="number"
                    className="w-full border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-purple-500" placeholder="120" />
                  <input name="tension_diastolique" value={formConstantes.tension_diastolique} onChange={handleConstantesChange} type="number"
                    className="w-full border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-purple-500" placeholder="80" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Pouls (bpm)</label>
                <input name="pouls" value={formConstantes.pouls} onChange={handleConstantesChange} type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="72" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Saturation (%)</label>
                <input name="saturation" value={formConstantes.saturation} onChange={handleConstantesChange} type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="98" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Glycémie (g/L)</label>
                <input name="glycemie" value={formConstantes.glycemie} onChange={handleConstantesChange} type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="0.9" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Observations</label>
                <input name="observations" value={formConstantes.observations} onChange={handleConstantesChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="Notes..." />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={sauvegarderConstantes} disabled={saving}
                className="bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                {saving ? 'Enregistrement...' : '💉 Enregistrer les constantes'}
              </button>
              <button onClick={() => setPatientConstantes(null)}
                className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-medium">
                Annuler
              </button>
            </div>
          </div>
        )}

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
                {recherche ? 'Aucun patient trouvé.' : 'Aucun patient enregistré.'}
              </p>
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
                      <div className="flex gap-2">
                        {role === 'infirmier' ? (
                          <button
                            onClick={() => { setPatientConstantes(patient.id); setFormConstantes({ poids: '', taille: '', tension_systolique: '', tension_diastolique: '', temperature: '', pouls: '', saturation: '', glycemie: '', observations: '' }) }}
                            className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                            💉 Prendre les constantes
                          </button>
                        ) : role === 'gestionnaire' ? (
                          <div className="flex gap-2">
                            <a href={`/dashboard/patients/${patient.id}`}
                              className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                              Voir →
                            </a>
                            <a href={`/dashboard/patients/${patient.id}/modifier`}
                              className="bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                              ✏️ Modifier
                            </a>
                            <a href={`/dashboard/rendez-vous/nouveau?patient=${patient.id}`}
                              className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors">
                              📅 RDV
                            </a>
                          </div>
                        ) : (
                          <a href={`/dashboard/patients/${patient.id}`}
                            className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                            Voir le dossier →
                          </a>
                        )}
                      </div>
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