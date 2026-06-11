'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Infirmiers() {
  const [infirmiers, setInfirmiers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [afficherForm, setAfficherForm] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [form, setForm] = useState({ nom: '', prenom: '', specialite: '', telephone: '', email: '' })
  const [erreur, setErreur] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const getInfirmiers = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('infirmiers').select('*').order('created_at', { ascending: false })
      setInfirmiers(data || [])
      setLoading(false)
    }
    getInfirmiers()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom) { setErreur('Nom et prénom obligatoires.'); return }
    setSaving(true)
    setErreur('')
    const { error } = await supabase.from('infirmiers').insert([{ ...form, actif: true }])
    if (error) { setErreur('Erreur lors de la création.'); setSaving(false); return }
    const { data } = await supabase.from('infirmiers').select('*').order('created_at', { ascending: false })
    setInfirmiers(data || [])
    setForm({ nom: '', prenom: '', specialite: '', telephone: '', email: '' })
    setAfficherForm(false)
    setSaving(false)
  }

  const infirmiersFiltres = infirmiers.filter(i =>
    `${i.prenom} ${i.nom} ${i.specialite}`.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Infirmiers</h1>
            <p className="text-slate-500 text-sm mt-1">{infirmiers.length} infirmier(s) enregistré(s)</p>
          </div>
          <button onClick={() => setAfficherForm(!afficherForm)}
            className="bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-purple-600 transition-colors">
            + Nouvel infirmier
          </button>
        </div>

        {afficherForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Ajouter un infirmier</h2>
            {erreur && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{erreur}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Prénom *</label>
                <input name="prenom" value={form.prenom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-700"
                  placeholder="Fatou" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nom *</label>
                <input name="nom" value={form.nom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-700"
                  placeholder="Diallo" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Spécialité</label>
                <input name="specialite" value={form.specialite} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-700"
                  placeholder="Soins généraux, Pédiatrie..." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Téléphone</label>
                <input name="telephone" value={form.telephone} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-700"
                  placeholder="77 000 00 00" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                <input name="email" value={form.email} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-700"
                  placeholder="infirmier@clinique.com" />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSubmit} disabled={saving}
                className="bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                {saving ? 'Enregistrement...' : 'Ajouter'}
              </button>
              <button onClick={() => setAfficherForm(false)}
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
            placeholder="Rechercher par nom ou spécialité..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-100">
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-slate-400 text-sm">Chargement...</p>
            </div>
          ) : infirmiersFiltres.length === 0 ? (
            <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-100">
              <p className="text-4xl mb-3">💉</p>
              <p className="text-slate-400 text-sm">Aucun infirmier enregistré.</p>
            </div>
          ) : (
            infirmiersFiltres.map((i) => (
              <div key={i.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-800 font-bold text-lg flex-shrink-0">
                    {i.prenom?.[0]}{i.nom?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{i.prenom} {i.nom}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700">
                      💉 {i.specialite || 'Soins généraux'}
                    </span>
                  </div>
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Actif</span>
                </div>
                <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                  {i.telephone && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>📞</span> {i.telephone}
                    </p>
                  )}
                  {i.email && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>✉️</span> {i.email}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  )
}