'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../components/Sidebar'

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function Disponibilites() {
  const [medecins, setMedecins] = useState<any[]>([])
  const [medecinSelectionne, setMedecinSelectionne] = useState<string>('')
  const [disponibilites, setDisponibilites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    jour_semaine: '1',
    heure_debut: '08:00',
    heure_fin: '12:00',
    duree_slot: '30',
  })
  const [saving, setSaving] = useState(false)
  const [succes, setSucces] = useState(false)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: m } = await supabase.from('medecins').select('*').eq('actif', true)
      setMedecins(m || [])
      if (m && m.length > 0) {
        setMedecinSelectionne(m[0].id)
        chargerDispos(m[0].id)
      }
      setLoading(false)
    }
    charger()
  }, [])

  const chargerDispos = async (medecinId: string) => {
    const { data } = await supabase
      .from('disponibilites')
      .select('*')
      .eq('medecin_id', medecinId)
      .order('jour_semaine', { ascending: true })
    setDisponibilites(data || [])
  }

  const handleMedecinChange = (id: string) => {
    setMedecinSelectionne(id)
    chargerDispos(id)
  }

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const ajouterDispo = async () => {
    if (!medecinSelectionne) return
    setSaving(true)
    await supabase.from('disponibilites').insert([{
      medecin_id: medecinSelectionne,
      jour_semaine: parseInt(form.jour_semaine),
      heure_debut: form.heure_debut,
      heure_fin: form.heure_fin,
      duree_slot: parseInt(form.duree_slot),
      actif: true,
    }])
    await chargerDispos(medecinSelectionne)
    setSucces(true)
    setSaving(false)
    setTimeout(() => setSucces(false), 2000)
  }

  const supprimerDispo = async (id: string) => {
    await supabase.from('disponibilites').delete().eq('id', id)
    await chargerDispos(medecinSelectionne)
  }

  const medecin = medecins.find(m => m.id === medecinSelectionne)

  const dispoParJour = JOURS.map((jour, index) => ({
    jour,
    index,
    dispos: disponibilites.filter(d => d.jour_semaine === index),
  }))

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Disponibilités des médecins</h1>
            <p className="text-slate-500 text-sm mt-1">Gérez les plages horaires de chaque médecin</p>
          </div>
          <a href="/dashboard/medecins"
            className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50">
            ← Retour médecins
          </a>
        </div>

        <div className="grid grid-cols-3 gap-6">

          <div className="col-span-1 flex flex-col gap-4">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">Choisir un médecin</h2>
              <div className="flex flex-col gap-2">
                {medecins.map((m) => (
                  <button key={m.id} onClick={() => handleMedecinChange(m.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      medecinSelectionne === m.id ? 'bg-blue-50 border-2 border-blue-800' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }`}>
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-800 font-semibold text-sm">
                      {m.prenom?.[0]}{m.nom?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Dr. {m.prenom} {m.nom}</p>
                      <p className="text-xs text-slate-500">{m.specialite || 'Généraliste'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {medecinSelectionne && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-semibold text-slate-800 mb-4">Ajouter une plage horaire</h2>
                {succes && (
                  <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg mb-3">✅ Plage ajoutée !</div>
                )}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Jour</label>
                    <select name="jour_semaine" value={form.jour_semaine} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-800">
                      {JOURS.map((j, i) => (
                        <option key={i} value={i}>{j}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Début</label>
                      <input name="heure_debut" type="time" value={form.heure_debut} onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-800" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Fin</label>
                      <input name="heure_fin" type="time" value={form.heure_fin} onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-800" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Durée par créneau</label>
                    <select name="duree_slot" value={form.duree_slot} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-800">
                      <option value="15">15 minutes</option>
                      <option value="20">20 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 heure</option>
                    </select>
                  </div>
                  <button onClick={ajouterDispo} disabled={saving}
                    className="bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium w-full">
                    {saving ? 'Ajout...' : '+ Ajouter cette plage'}
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4">
                Planning de {medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : '—'}
              </h2>

              {loading ? (
                <p className="text-slate-400 text-sm">Chargement...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dispoParJour.filter(d => d.index !== 0).map((jour) => (
                    <div key={jour.index} className={`rounded-xl border p-4 ${jour.dispos.length > 0 ? 'border-blue-100 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">{jour.jour}</span>
                        {jour.dispos.length === 0 && (
                          <span className="text-xs text-slate-400">Pas de disponibilité</span>
                        )}
                      </div>
                      {jour.dispos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {jour.dispos.map((d) => (
                            <div key={d.id} className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-1.5">
                              <span className="text-xs font-medium text-blue-800">
                                {d.heure_debut.slice(0, 5)} — {d.heure_fin.slice(0, 5)}
                              </span>
                              <span className="text-xs text-slate-400">({d.duree_slot} min/patient)</span>
                              <button onClick={() => supprimerDispo(d.id)}
                                className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
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