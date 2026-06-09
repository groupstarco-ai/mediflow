'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../components/Sidebar'

export default function NouveauDossier() {
  const [patients, setPatients] = useState<any[]>([])
  const [medecins, setMedecins] = useState<any[]>([])
  const [form, setForm] = useState({
    patient_id: '',
    medecin_id: '',
    diagnostic: '',
    traitement: '',
    ordonnance: '',
    observations: '',
    niveau_confidentialite: '1',
  })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    const charger = async () => {
      const { data: p } = await supabase.from('patients').select('id, nom, prenom')
      const { data: m } = await supabase.from('medecins').select('id, nom, prenom')
      setPatients(p || [])
      setMedecins(m || [])
    }
    charger()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.patient_id || !form.diagnostic) {
      setErreur('Patient et diagnostic sont obligatoires.')
      return
    }
    setLoading(true)
    setErreur('')
    const { error } = await supabase.from('dossiers_medicaux').insert([{
      patient_id: form.patient_id,
      medecin_id: form.medecin_id || null,
      diagnostic: form.diagnostic,
      traitement: form.traitement,
      ordonnance: form.ordonnance,
      observations: form.observations,
      niveau_confidentialite: parseInt(form.niveau_confidentialite),
    }])
    if (error) {
      setErreur('Erreur lors de la création du dossier.')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard/dossiers'
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center gap-4 mb-8">
          <a href="/dashboard/dossiers" className="text-slate-400 hover:text-slate-600 text-sm">
            Dossiers médicaux
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 text-sm font-medium">Nouveau dossier</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-8 max-w-2xl">
          <h1 className="text-xl font-bold text-slate-900 mb-6">Créer un dossier médical</h1>

          {erreur && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {erreur}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Patient *</label>
              <select name="patient_id" value={form.patient_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                <option value="">Choisir un patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Médecin</label>
              <select name="medecin_id" value={form.medecin_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                <option value="">Choisir un médecin</option>
                {medecins.map((m) => (
                  <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Diagnostic *</label>
              <textarea name="diagnostic" value={form.diagnostic} onChange={handleChange} rows={3}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="Diagnostic médical..." />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Traitement</label>
              <textarea name="traitement" value={form.traitement} onChange={handleChange} rows={3}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="Traitement prescrit..." />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Ordonnance</label>
              <textarea name="ordonnance" value={form.ordonnance} onChange={handleChange} rows={3}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="Médicaments prescrits..." />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Observations</label>
              <textarea name="observations" value={form.observations} onChange={handleChange} rows={2}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="Observations complémentaires..." />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Niveau de confidentialité</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="niveau_confidentialite" value="1"
                    checked={form.niveau_confidentialite === '1'}
                    onChange={handleChange} className="accent-blue-800" />
                  <span className="text-sm text-slate-700">Standard</span>
                  <span className="text-xs text-slate-400">(grippe, fracture, diabète...)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="niveau_confidentialite" value="2"
                    checked={form.niveau_confidentialite === '2'}
                    onChange={handleChange} className="accent-red-600" />
                  <span className="text-sm text-red-600 font-medium">Confidentiel</span>
                  <span className="text-xs text-slate-400">(VIH, cancer, addiction...)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
              {loading ? 'Enregistrement...' : 'Créer le dossier'}
            </button>
            <a href="/dashboard/dossiers"
              className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-medium">
              Annuler
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}