'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../../components/Sidebar'

export default function ModifierDossier({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [form, setForm] = useState({
    antecedents_medicaux: '',
    antecedents_chirurgicaux: '',
    allergies: '',
    medicaments_en_cours: '',
    motif_consultation: '',
    diagnostic: '',
    traitement: '',
    ordonnance: '',
    examens_demandes: '',
    observations: '',
    niveau_confidentialite: '1',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)
  const [patient, setPatient] = useState<any>(null)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase
        .from('dossiers_medicaux')
        .select('*, patients(nom, prenom, id)')
        .eq('id', id)
        .single()
      if (data) {
        setPatient(data.patients)
        const obs = data.observations || ''
        const extraire = (cle: string) => {
          const regex = new RegExp(`${cle}: ([^\n]*)`)
          return obs.match(regex)?.[1] || ''
        }
        setForm({
          antecedents_medicaux: extraire('ANTÉCÉDENTS MÉDICAUX'),
          antecedents_chirurgicaux: extraire('ANTÉCÉDENTS CHIRURGICAUX'),
          allergies: extraire('ALLERGIES'),
          medicaments_en_cours: extraire('MÉDICAMENTS EN COURS'),
          motif_consultation: extraire('MOTIF'),
          examens_demandes: extraire('EXAMENS DEMANDÉS'),
          observations: extraire('OBSERVATIONS'),
          diagnostic: data.diagnostic || '',
          traitement: data.traitement || '',
          ordonnance: data.ordonnance || '',
          niveau_confidentialite: data.niveau_confidentialite?.toString() || '1',
        })
      }
      setLoading(false)
    }
    charger()
  }, [id])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.diagnostic) {
      setErreur('Le diagnostic est obligatoire.')
      return
    }
    setSaving(true)
    setErreur('')
    const observations = [
      form.antecedents_medicaux ? `ANTÉCÉDENTS MÉDICAUX: ${form.antecedents_medicaux}` : '',
      form.antecedents_chirurgicaux ? `ANTÉCÉDENTS CHIRURGICAUX: ${form.antecedents_chirurgicaux}` : '',
      form.allergies ? `ALLERGIES: ${form.allergies}` : '',
      form.medicaments_en_cours ? `MÉDICAMENTS EN COURS: ${form.medicaments_en_cours}` : '',
      form.motif_consultation ? `MOTIF: ${form.motif_consultation}` : '',
      form.examens_demandes ? `EXAMENS DEMANDÉS: ${form.examens_demandes}` : '',
      form.observations ? `OBSERVATIONS: ${form.observations}` : '',
    ].filter(Boolean).join('\n')

    const { error } = await supabase.from('dossiers_medicaux').update({
      diagnostic: form.diagnostic,
      traitement: form.traitement,
      ordonnance: form.ordonnance,
      observations,
      niveau_confidentialite: parseInt(form.niveau_confidentialite),
    }).eq('id', id)

    if (error) { setErreur('Erreur lors de la modification.'); setSaving(false); return }
    setSucces(true)
    setSaving(false)
    setTimeout(() => { window.location.href = '/dashboard/dossiers' }, 1500)
  }

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6"><p className="text-slate-400">Chargement...</p></main>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center gap-4 mb-8">
          <a href="/dashboard/dossiers" className="text-slate-400 hover:text-slate-600 text-sm">Dossiers médicaux</a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 text-sm font-medium">Modifier</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Modifier le dossier médical</h1>
          <p className="text-slate-500 text-sm mb-6">Patient : {patient?.prenom} {patient?.nom}</p>

          {erreur && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{erreur}</div>}
          {succes && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 text-sm px-4 py-3 rounded-xl mb-6">✅ Modifications enregistrées !</div>}

          <div className="flex flex-col gap-6">

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Antécédents</h2>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Antécédents médicaux</label>
                  <textarea name="antecedents_medicaux" value={form.antecedents_medicaux} onChange={handleChange} rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    placeholder="Diabète, hypertension, asthme..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Antécédents chirurgicaux</label>
                  <textarea name="antecedents_chirurgicaux" value={form.antecedents_chirurgicaux} onChange={handleChange} rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    placeholder="Appendicectomie 2015..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Allergies</label>
                    <input name="allergies" value={form.allergies} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                      placeholder="Pénicilline..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Médicaments en cours</label>
                    <input name="medicaments_en_cours" value={form.medicaments_en_cours} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                      placeholder="Metformine 500mg..." />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Consultation</h2>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Motif de consultation</label>
                  <input name="motif_consultation" value={form.motif_consultation} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    placeholder="Fièvre depuis 3 jours..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Diagnostic *</label>
                  <textarea name="diagnostic" value={form.diagnostic} onChange={handleChange} rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    placeholder="Diagnostic médical..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Examens demandés</label>
                  <input name="examens_demandes" value={form.examens_demandes} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    placeholder="NFS, glycémie..." />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Prescription</h2>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Traitement</label>
                  <textarea name="traitement" value={form.traitement} onChange={handleChange} rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600"
                    placeholder="Traitement prescrit..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Ordonnance</label>
                  <textarea name="ordonnance" value={form.ordonnance} onChange={handleChange} rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600"
                    placeholder="Paracétamol 1g — 3x/jour..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Observations</label>
                  <textarea name="observations" value={form.observations} onChange={handleChange} rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600"
                    placeholder="Observations complémentaires..." />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Niveau de confidentialité</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.niveau_confidentialite === '1' ? 'border-blue-800 bg-blue-50' : 'border-slate-200'}`}>
                  <input type="radio" name="niveau_confidentialite" value="1" checked={form.niveau_confidentialite === '1'} onChange={handleChange} className="hidden" />
                  <span className="text-xl">✅</span>
                  <div><p className="text-sm font-medium text-slate-700">Standard</p><p className="text-xs text-slate-400">Grippe, fracture, diabète...</p></div>
                </label>
                <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.niveau_confidentialite === '2' ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                  <input type="radio" name="niveau_confidentialite" value="2" checked={form.niveau_confidentialite === '2'} onChange={handleChange} className="hidden" />
                  <span className="text-xl">🔒</span>
                  <div><p className="text-sm font-medium text-red-600">Confidentiel</p><p className="text-xs text-slate-400">VIH, cancer, addiction...</p></div>
                </label>
              </div>
            </div>

          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={handleSubmit} disabled={saving}
              className="bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
              {saving ? 'Enregistrement...' : '💾 Sauvegarder'}
            </button>
            <a href="/dashboard/dossiers"
              className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-medium">
              Annuler
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}