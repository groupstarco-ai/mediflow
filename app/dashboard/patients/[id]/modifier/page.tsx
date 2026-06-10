'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../../components/Sidebar'

export default function ModifierPatient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    telephone: '',
    email: '',
    adresse: '',
    groupe_sanguin: '',
    numero_cni: '',
    contact_urgence: '',
    adresse_urgence: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('patients').select('*').eq('id', id).single()
      if (data) {
        setForm({
          nom: data.nom || '',
          prenom: data.prenom || '',
          date_naissance: data.date_naissance || '',
          sexe: data.sexe || '',
          telephone: data.telephone || '',
          email: data.email || '',
          adresse: data.adresse || '',
          groupe_sanguin: data.groupe_sanguin || '',
          numero_cni: data.numero_cni || '',
          contact_urgence: data.contact_urgence || '',
          adresse_urgence: data.adresse_urgence || '',
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
    if (!form.nom || !form.prenom || !form.telephone) {
      setErreur('Nom, prénom et téléphone sont obligatoires.')
      return
    }
    setSaving(true)
    setErreur('')
    const { error } = await supabase.from('patients').update(form).eq('id', id)
    if (error) {
      setErreur('Erreur lors de la modification.')
      setSaving(false)
      return
    }
    setSucces(true)
    setSaving(false)
    setTimeout(() => {
      window.location.href = `/dashboard/patients/${id}`
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
          <a href={`/dashboard/patients/${id}`} className="text-slate-400 hover:text-slate-600 text-sm">
            Dossier patient
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 text-sm font-medium">Modifier</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Modifier le dossier patient</h1>
          <p className="text-slate-500 text-sm mb-6">Informations administratives</p>

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

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Identité</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Prénom *</label>
                <input name="prenom" value={form.prenom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nom *</label>
                <input name="nom" value={form.nom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Date de naissance</label>
                <input name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Sexe</label>
                <select name="sexe" value={form.sexe} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="">Choisir</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">N° CNI</label>
                <input name="numero_cni" value={form.numero_cni} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="1 23 45 678 901 23" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Groupe sanguin</label>
                <select name="groupe_sanguin" value={form.groupe_sanguin} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="">Choisir</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contact</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Téléphone *</label>
                <input name="telephone" value={form.telephone} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                <input name="email" value={form.email} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Adresse</label>
                <input name="adresse" value={form.adresse} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contact d'urgence</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nom et téléphone</label>
                <input name="contact_urgence" value={form.contact_urgence} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Fatou Mbaye — 77 111 22 33" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Relation / Adresse</label>
                <input name="adresse_urgence" value={form.adresse_urgence} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Mère — Parcelles Assainies" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={handleSubmit} disabled={saving}
              className="bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
              {saving ? 'Enregistrement...' : '💾 Sauvegarder'}
            </button>
            <a href={`/dashboard/patients/${id}`}
              className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-medium">
              Annuler
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}