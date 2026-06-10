'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../components/Sidebar'
import { enregistrerAction } from '@/lib/audit'

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function NouveauRdv() {
  const [patients, setPatients] = useState<any[]>([])
  const [medecins, setMedecins] = useState<any[]>([])
  const [disponibilites, setDisponibilites] = useState<any[]>([])
  const [creneaux, setCreneaux] = useState<string[]>([])
  const [form, setForm] = useState({
    patient_id: '',
    medecin_id: '',
    date: '',
    heure: '',
    duree_minutes: '30',
    motif: '',
    priorite: 'normal',
  })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    const charger = async () => {
      const { data: p } = await supabase.from('patients').select('id, nom, prenom')
      const { data: m } = await supabase.from('medecins').select('id, nom, prenom, specialite')
      setPatients(p || [])
      setMedecins(m || [])
    }
    charger()
  }, [])

  useEffect(() => {
    if (form.medecin_id) {
      chargerDispos(form.medecin_id)
    } else {
      setDisponibilites([])
      setCreneaux([])
    }
  }, [form.medecin_id])

  useEffect(() => {
    if (form.date && form.medecin_id) {
      genererCreneaux()
    }
  }, [form.date, disponibilites])

  const chargerDispos = async (medecinId: string) => {
    const { data } = await supabase
      .from('disponibilites')
      .select('*')
      .eq('medecin_id', medecinId)
      .eq('actif', true)
    setDisponibilites(data || [])
  }

  const genererCreneaux = async () => {
    if (!form.date || disponibilites.length === 0) { setCreneaux([]); return }

    const jourSemaine = new Date(form.date).getDay()
    const disposDuJour = disponibilites.filter(d => d.jour_semaine === jourSemaine)

    if (disposDuJour.length === 0) { setCreneaux([]); return }

    const { data: rdvsExistants } = await supabase
      .from('rendez_vous')
      .select('date_heure, duree_minutes')
      .eq('medecin_id', form.medecin_id)
      .gte('date_heure', `${form.date}T00:00:00`)
      .lte('date_heure', `${form.date}T23:59:59`)
      .neq('statut', 'annule')

    const slots: string[] = []
    disposDuJour.forEach(dispo => {
      const [hDebut, mDebut] = dispo.heure_debut.split(':').map(Number)
      const [hFin, mFin] = dispo.heure_fin.split(':').map(Number)
      let current = hDebut * 60 + mDebut
      const fin = hFin * 60 + mFin

      while (current + dispo.duree_slot <= fin) {
        const h = Math.floor(current / 60).toString().padStart(2, '0')
        const m = (current % 60).toString().padStart(2, '0')
        const heure = `${h}:${m}`
        const dateHeure = `${form.date}T${heure}`

        const occupe = rdvsExistants?.some(rdv => {
          const rdvDebut = new Date(rdv.date_heure).getTime()
          const rdvFin = rdvDebut + rdv.duree_minutes * 60000
          const slotDebut = new Date(dateHeure).getTime()
          const slotFin = slotDebut + dispo.duree_slot * 60000
          return slotDebut < rdvFin && slotFin > rdvDebut
        })

        if (!occupe) slots.push(heure)
        current += dispo.duree_slot
      }
    })
    setCreneaux(slots)
  }

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.patient_id || !form.date) {
      setErreur('Patient et date sont obligatoires.')
      return
    }
    if (!form.heure && creneaux.length > 0) {
      setErreur('Veuillez choisir un créneau horaire.')
      return
    }
    setLoading(true)
    setErreur('')

    const dateHeure = form.heure ? `${form.date}T${form.heure}` : `${form.date}T08:00`

    const { error } = await supabase.from('rendez_vous').insert([{
      patient_id: form.patient_id,
      medecin_id: form.medecin_id || null,
      date_heure: dateHeure,
      duree_minutes: parseInt(form.duree_minutes),
      motif: form.motif,
      statut: 'planifie',
      priorite: form.priorite,
    }])
    if (error) {
      setErreur('Erreur lors de la création du RDV.')
      setLoading(false)
      return
    }
    const patient = patients.find(p => p.id === form.patient_id)
    const medecin = medecins.find(m => m.id === form.medecin_id)
    await enregistrerAction('creation', 'rendez_vous',
      `Nouveau RDV — Patient: ${patient?.prenom} ${patient?.nom} — Médecin: Dr. ${medecin?.prenom} ${medecin?.nom} — Date: ${dateHeure} — Priorité: ${form.priorite}`)
    window.location.href = '/dashboard/rendez-vous'
  }

  const prioriteConfig: any = {
    urgent: { label: '🚨 Urgent', bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', desc: 'Cas nécessitant une attention immédiate' },
    normal: { label: '📅 Normal', bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', desc: 'Consultation standard' },
    suivi: { label: '🔄 Suivi', bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', desc: 'Suivi de traitement ou résultats' },
  }

  const jourSemaine = form.date ? new Date(form.date).getDay() : -1
  const disposDuJour = disponibilites.filter(d => d.jour_semaine === jourSemaine)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center gap-4 mb-8">
          <a href="/dashboard/rendez-vous" className="text-slate-400 hover:text-slate-600 text-sm">Rendez-vous</a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 text-sm font-medium">Nouveau RDV</span>
        </div>

        <div className="grid grid-cols-3 gap-6">

          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h1 className="text-xl font-bold text-slate-900 mb-6">Créer un rendez-vous</h1>

              {erreur && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{erreur}</div>
              )}

              <div className="flex flex-col gap-5">

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Niveau de priorité</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(prioriteConfig).map(([key, config]: any) => (
                      <label key={key} className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.priorite === key ? `${config.bg} ${config.border}` : 'border-slate-200'}`}>
                        <input type="radio" name="priorite" value={key} checked={form.priorite === key} onChange={handleChange} className="hidden" />
                        <span className="text-sm font-medium text-slate-700">{config.label}</span>
                        <span className="text-xs text-slate-400">{config.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom} {m.specialite ? `— ${m.specialite}` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Date *</label>
                  <input name="date" type="date" value={form.date} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                    min={new Date().toISOString().split('T')[0]} />
                </div>

                {form.date && form.medecin_id && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Créneau disponible — {JOURS[jourSemaine]}
                    </label>
                    {disposDuJour.length === 0 ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
                        ⚠️ Ce médecin n'a pas de disponibilité ce jour. Choisissez une autre date ou configurez ses disponibilités.
                      </div>
                    ) : creneaux.length === 0 ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                        ❌ Tous les créneaux sont occupés ce jour. Choisissez une autre date.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {creneaux.map((heure) => (
                          <button key={heure} type="button" onClick={() => setForm({ ...form, heure })}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                              form.heure === heure ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-800'
                            }`}>
                            {heure}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(!form.medecin_id || disposDuJour.length === 0) && form.date && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Heure manuellement</label>
                    <input name="heure" type="time" value={form.heure} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800" />
                  </div>
                )}

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
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-6">
              <h2 className="font-semibold text-slate-800 mb-4">Guide de priorité</h2>
              <div className="flex flex-col gap-3">
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <p className="text-sm font-semibold text-red-700 mb-1">🚨 Urgent</p>
                  <p className="text-xs text-red-600">Douleur intense, fièvre élevée, difficultés respiratoires, traumatisme</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-700 mb-1">📅 Normal</p>
                  <p className="text-xs text-blue-600">Consultation générale, grippe, toux, douleurs modérées</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <p className="text-sm font-semibold text-green-700 mb-1">🔄 Suivi</p>
                  <p className="text-xs text-green-600">Résultats d'analyses, renouvellement ordonnance, contrôle tension</p>
                </div>
              </div>
              {form.medecin_id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Disponibilités</p>
                  {disponibilites.length === 0 ? (
                    <div className="text-xs text-slate-400">
                      Aucune disponibilité configurée.
                      <a href="/dashboard/medecins/disponibilites" className="text-blue-800 ml-1 underline">Configurer →</a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {[1,2,3,4,5,6].map(jour => {
                        const dispos = disponibilites.filter(d => d.jour_semaine === jour)
                        if (dispos.length === 0) return null
                        return (
                          <div key={jour} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 w-14">{['','Lun','Mar','Mer','Jeu','Ven','Sam'][jour]}</span>
                            <div className="flex gap-1 flex-wrap">
                              {dispos.map(d => (
                                <span key={d.id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                  {d.heure_debut.slice(0,5)}–{d.heure_fin.slice(0,5)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}