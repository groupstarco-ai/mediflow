'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../components/Sidebar'
import { enregistrerAction } from '@/lib/audit'

export default function NouveauRdv() {
  const [patients, setPatients] = useState<any[]>([])
  const [medecins, setMedecins] = useState<any[]>([])
  const [form, setForm] = useState({
    patient_id: '',
    medecin_id: '',
    date_heure: '',
    duree_minutes: '30',
    motif: '',
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
    if (!form.patient_id || !form.date_heure) {
      setErreur('Patient et date sont obligatoires.')
      return
    }
    setLoading(true)
    setErreur('')
    const { error } = await supabase.from('rendez_vous').insert([{
      patient_id: form.patient_id,
      medecin_id: form.medecin_id || null,
      date_heure: form.date_heure,
      duree_minutes: parseInt(form.duree_minutes),
      motif: form.motif,
      statut: 'planifie',
    }])
    if (error) {
      setErreur('Erreur lors de la création du RDV.')
      setLoading(false)
      return
    }
    const patient = patients.find(p => p.id === form.patient_id)
    const medecin = medecins.find(m => m.id === form.medecin_id)
    await enregistrerAction(
      'creation',
      'rendez_vous',
      `Nouveau RDV — Patient: ${patient?.prenom} ${patient?.nom} — Médecin: Dr. ${medecin?.prenom} ${medecin?.nom} — Date: ${form.date_heure}`
    )
    window.location.href = '/dashboard/rendez-vous'
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center gap-4 mb-8">
          <a href="/dashboard/rendez-vous" className="text-slate-400 hover:text-slate-600 text-sm">
            Rendez-vous
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 text-sm font-medium">Nouveau RDV</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
          <h1 className="text-xl font-bold text-slate-900 mb-6">Créer un rendez-vous</h1>

          {erreur && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {erreur}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Patient *</label>
              <select name="patient_id" value={form.patient_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                <option value="">Choisir un patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Médecin</label>
              <select name="medecin_id" value={form.medecin_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                <option value="">Choisir un médecin</option>
                {medecins.map((m) => (
                  <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Date et heure *</label>
              <input name="date_heure" type="datetime-local" value={form.date_heure} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Durée (minutes)</label>
              <select name="duree_minutes" value={form.duree_minutes} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 heure</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Motif</label>
              <textarea name="motif" value={form.motif} onChange={handleChange} rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="Consultation générale, suivi tension..." />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
              {loading ? 'Enregistrement...' : 'Créer le RDV'}
            </button>
            <a href="/dashboard/rendez-vous"
              className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-medium">
              Annuler
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}