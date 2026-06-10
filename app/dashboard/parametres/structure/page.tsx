'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../components/Sidebar'

export default function ConfigStructure() {
  const [form, setForm] = useState({
    nom: '',
    type: '',
    adresse: '',
    telephone: '',
    email: '',
  })
  const [structureId, setStructureId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [succes, setSucces] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('structures').select('*').limit(1).single()
      if (data) {
        setStructureId(data.id)
        setForm({
          nom: data.nom || '',
          type: data.type || '',
          adresse: data.adresse || '',
          telephone: data.telephone || '',
          email: data.email || '',
        })
      }
      setLoading(false)
    }
    charger()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.nom) { setErreur('Le nom de la structure est obligatoire.'); return }
    setSaving(true)
    setErreur('')
    if (structureId) {
      await supabase.from('structures').update(form).eq('id', structureId)
    } else {
      const { data } = await supabase.from('structures').insert([{ ...form, plan_saas: 'gratuit' }]).select().single()
      if (data) setStructureId(data.id)
    }
    setSucces(true)
    setSaving(false)
    setTimeout(() => setSucces(false), 3000)
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
          <a href="/dashboard/parametres" className="text-slate-400 hover:text-slate-600 text-sm">Paramètres</a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 text-sm font-medium">Ma structure</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">🏥</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Informations de la structure</h1>
              <p className="text-slate-500 text-sm">Ces informations apparaîtront sur vos factures et documents</p>
            </div>
          </div>

          {erreur && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {erreur}
            </div>
          )}

          {succes && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 text-sm px-4 py-3 rounded-xl mb-6">
              ✅ Informations enregistrées avec succès !
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Nom de la structure *</label>
              <input name="nom" value={form.nom} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="Clinique Santé Plus" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Type de structure</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                <option value="">Choisir</option>
                <option value="clinique">Clinique privée</option>
                <option value="cabinet">Cabinet médical</option>
                <option value="hopital">Hôpital</option>
                <option value="centre_sante">Centre de santé</option>
                <option value="polyclinique">Polyclinique</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Adresse</label>
              <input name="adresse" value={form.adresse} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="Rue 10, Mermoz, Dakar" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="33 800 00 00" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
              <input name="email" value={form.email} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                placeholder="contact@clinique.sn" />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={handleSubmit} disabled={saving}
              className="bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
              {saving ? 'Enregistrement...' : '💾 Sauvegarder'}
            </button>
            <a href="/dashboard/parametres"
              className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-medium">
              Retour
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}