'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../../components/Sidebar'

export default function ModifierRdv({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [patients, setPatients] = useState<any[]>([])
  const [medecins, setMedecins] = useState<any[]>([])
  const [form, setForm] = useState({
    patient_id: '',
    medecin_id: '',
    date_heure: '',
    duree_minutes: '30',
    motif: '',
    statut: 'planifie',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: p } = await supabase.from('patients').select('id, nom, prenom')
      const { data: m } = await supabase.from('medecins').select('id, nom, prenom')
      setPatients(p || [])
      setMedecins(m || [])

      const { data: rdv } = await supabase.from('rendez_vous').select('*').eq('id', id).single()
      if (rdv) {
        setForm({
          patient_id: rdv.patient_id || '',
          medecin_id: rdv.medecin_id || '',
          date_heure: rdv.date_heure ? rdv.date_heure.slice(0, 16) : '',
          duree_minutes: rdv.duree_minutes?.toString() || '30',
          motif: rdv.motif || '',
          statut: rdv.statut || 'planifie',
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
    if (!form.patient_id || !form.date_heure) {
      setErreur('Patient et date sont obligatoires.')
      return
    }
    setSaving(true)
    setErreur('')
    const { error } = await supabase.from('rendez_vous').update({
      patient_id: form.patient_id,
      medecin_id: form.medecin_id || null,
      date_heure: form.date_heure,
      duree_minutes: parseInt(form.duree_minutes),
      motif: form.motif,
      statut: form.statut,
    }).eq('id', id)
    if (error) {
      setErreur('Erreur lors de la modification.')
      setSaving(false)
      return
    }
    setSucces(true)
    setSaving(false)
    setTimeout(() => {
      window.location.href = '/dashboard/rendez-vous'
    }, 1500)
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
          <a href="/dashboard/rendez-vous" className="text-slate-400 hover:text-slate-600 text-sm">
            Rendez-vous
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 text-sm font-medium">Modifier</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
          <h1 className="text-xl font-bold text-slate-900 mb-6">Modifier le rendez-vous</h1>

          {erreur && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {erreur}
            </div>
          )}

          {succes && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 text-sm px-4 py-3 rounded-xl mb-6">
              ✅ Modifications enregistrées ! Redirection en cours...
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
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Statut</label>
              <select name="statut" value={form.statut} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={handleSubmit} disabled={saving}
              className="bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
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