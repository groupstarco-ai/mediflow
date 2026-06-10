'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../components/Sidebar'

function calculerAge(dateNaissance: string) {
  if (!dateNaissance) return null
  const naissance = new Date(dateNaissance)
  const aujourd_hui = new Date()
  let age = aujourd_hui.getFullYear() - naissance.getFullYear()
  const m = aujourd_hui.getMonth() - naissance.getMonth()
  if (m < 0 || (m === 0 && aujourd_hui.getDate() < naissance.getDate())) age--
  return age
}

export default function DetailPatient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [patient, setPatient] = useState<any>(null)
  const [dossiers, setDossiers] = useState<any[]>([])
  const [rdvs, setRdvs] = useState<any[]>([])
  const [constantes, setConstantes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [afficherConstantes, setAfficherConstantes] = useState(false)
  const [formConstantes, setFormConstantes] = useState({
    poids: '', taille: '', tension_systolique: '', tension_diastolique: '',
    temperature: '', pouls: '', saturation: '', glycemie: '', observations: '',
  })
  const [savingConstantes, setSavingConstantes] = useState(false)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: p } = await supabase.from('patients').select('*').eq('id', id).single()
      setPatient(p)
      const { data: d } = await supabase.from('dossiers_medicaux').select('*, medecins(nom, prenom)').eq('patient_id', id).order('date_consultation', { ascending: false })
      setDossiers(d || [])
      const { data: r } = await supabase.from('rendez_vous').select('*, medecins(nom, prenom)').eq('patient_id', id).order('date_heure', { ascending: false })
      setRdvs(r || [])
      const { data: c } = await supabase.from('constantes_vitales').select('*').eq('patient_id', id).order('created_at', { ascending: false })
      setConstantes(c || [])
      setLoading(false)
    }
    charger()
  }, [id])

  const handleConstantesChange = (e: any) => {
    setFormConstantes({ ...formConstantes, [e.target.name]: e.target.value })
  }

  const sauvegarderConstantes = async () => {
    setSavingConstantes(true)
    await supabase.from('constantes_vitales').insert([{
      patient_id: id,
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
    const { data: c } = await supabase.from('constantes_vitales').select('*').eq('patient_id', id).order('created_at', { ascending: false })
    setConstantes(c || [])
    setFormConstantes({ poids: '', taille: '', tension_systolique: '', tension_diastolique: '', temperature: '', pouls: '', saturation: '', glycemie: '', observations: '' })
    setAfficherConstantes(false)
    setSavingConstantes(false)
  }

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6"><p className="text-slate-400">Chargement...</p></main>
    </div>
  )

  const age = calculerAge(patient?.date_naissance)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a href="/dashboard/patients" className="text-slate-400 hover:text-slate-600 text-sm">Patients</a>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 text-sm font-medium">{patient?.prenom} {patient?.nom}</span>
          </div>
          <a href={`/dashboard/patients/${id}/modifier`}
            className="bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            ✏️ Modifier
          </a>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-1 flex flex-col gap-4">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-800">{patient?.prenom?.[0]}{patient?.nom?.[0]}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{patient?.prenom} {patient?.nom}</h1>
              <p className="text-slate-500 text-sm mt-1">{patient?.telephone}</p>
              <p className="text-slate-500 text-sm">{patient?.email}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Âge</span>
                  <span className="text-slate-800 font-medium">{age !== null ? `${age} ans` : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date de naissance</span>
                  <span className="text-slate-800">{patient?.date_naissance || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sexe</span>
                  <span className="text-slate-800 capitalize">{patient?.sexe || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Groupe sanguin</span>
                  <span className="text-slate-800 font-medium">{patient?.groupe_sanguin || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">N° CNI</span>
                  <span className="text-slate-800">{patient?.numero_cni || '—'}</span>
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

            {patient?.contact_urgence && (
              <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">🚨 Contact d'urgence</p>
                <p className="text-sm font-medium text-slate-800">{patient.contact_urgence}</p>
                {patient.adresse_urgence && <p className="text-xs text-slate-500 mt-1">{patient.adresse_urgence}</p>}
              </div>
            )}

          </div>

          <div className="col-span-2 flex flex-col gap-6">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💉</span>
                  <h2 className="font-semibold text-slate-800">Constantes vitales</h2>
                </div>
                <button onClick={() => setAfficherConstantes(!afficherConstantes)}
                  className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                  + Nouvelles constantes
                </button>
              </div>

              {afficherConstantes && (
                <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3">Saisie infirmier</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Poids (kg)</label>
                      <input name="poids" value={formConstantes.poids} onChange={handleConstantesChange} type="number"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="70" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Taille (cm)</label>
                      <input name="taille" value={formConstantes.taille} onChange={handleConstantesChange} type="number"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="170" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Température (°C)</label>
                      <input name="temperature" value={formConstantes.temperature} onChange={handleConstantesChange} type="number"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="37.5" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Tension (sys)</label>
                      <input name="tension_systolique" value={formConstantes.tension_systolique} onChange={handleConstantesChange} type="number"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="120" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Tension (dia)</label>
                      <input name="tension_diastolique" value={formConstantes.tension_diastolique} onChange={handleConstantesChange} type="number"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="80" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Pouls (bpm)</label>
                      <input name="pouls" value={formConstantes.pouls} onChange={handleConstantesChange} type="number"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="72" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Saturation (%)</label>
                      <input name="saturation" value={formConstantes.saturation} onChange={handleConstantesChange} type="number"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="98" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Glycémie (g/L)</label>
                      <input name="glycemie" value={formConstantes.glycemie} onChange={handleConstantesChange} type="number"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="0.9" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Observations</label>
                      <input name="observations" value={formConstantes.observations} onChange={handleConstantesChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                        placeholder="Notes..." />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button onClick={sauvegarderConstantes} disabled={savingConstantes}
                      className="bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium">
                      {savingConstantes ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button onClick={() => setAfficherConstantes(false)}
                      className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-medium">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {constantes.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune constante enregistrée.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {constantes.slice(0, 3).map((c) => (
                    <div key={c.id} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-2">{new Date(c.created_at).toLocaleDateString('fr-FR')} à {new Date(c.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {c.poids && <div className="text-center"><p className="text-xs text-slate-500">Poids</p><p className="text-sm font-semibold text-slate-800">{c.poids} kg</p></div>}
                        {c.taille && <div className="text-center"><p className="text-xs text-slate-500">Taille</p><p className="text-sm font-semibold text-slate-800">{c.taille} cm</p></div>}
                        {c.temperature && <div className="text-center"><p className="text-xs text-slate-500">Temp.</p><p className="text-sm font-semibold text-slate-800">{c.temperature}°C</p></div>}
                        {c.tension_systolique && <div className="text-center"><p className="text-xs text-slate-500">Tension</p><p className="text-sm font-semibold text-slate-800">{c.tension_systolique}/{c.tension_diastolique}</p></div>}
                        {c.pouls && <div className="text-center"><p className="text-xs text-slate-500">Pouls</p><p className="text-sm font-semibold text-slate-800">{c.pouls} bpm</p></div>}
                        {c.saturation && <div className="text-center"><p className="text-xs text-slate-500">SpO2</p><p className="text-sm font-semibold text-slate-800">{c.saturation}%</p></div>}
                        {c.glycemie && <div className="text-center"><p className="text-xs text-slate-500">Glycémie</p><p className="text-sm font-semibold text-slate-800">{c.glycemie} g/L</p></div>}
                      </div>
                      {c.observations && <p className="text-xs text-slate-500 mt-2 italic">{c.observations}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <h2 className="font-semibold text-slate-800">Dossiers médicaux</h2>
                </div>
                <a href="/dashboard/dossiers/nouveau" className="text-blue-800 text-sm">+ Nouveau</a>
              </div>
              {dossiers.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun dossier médical.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dossiers.map((d) => (
                    <div key={d.id} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-800">{new Date(d.date_consultation).toLocaleDateString('fr-FR')}</span>
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

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <h2 className="font-semibold text-slate-800">Rendez-vous</h2>
                </div>
                <a href="/dashboard/rendez-vous/nouveau" className="text-blue-800 text-sm">+ Nouveau</a>
              </div>
              {rdvs.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun rendez-vous.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {rdvs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
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