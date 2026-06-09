'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Medecins() {
  const [medecins, setMedecins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nom: '', prenom: '', specialite: '', telephone: '', email: '' })
  const [afficherForm, setAfficherForm] = useState(false)
  const [erreur, setErreur] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const getMedecins = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('medecins').select('*')
      setMedecins(data || [])
      setLoading(false)
    }
    getMedecins()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom) { setErreur('Nom et prénom obligatoires.'); return }
    setSaving(true)
    setErreur('')
    const { error } = await supabase.from('medecins').insert([{ ...form, actif: true }])
    if (error) { setErreur('Erreur lors de la création.'); setSaving(false); return }
    const { data } = await supabase.from('medecins').select('*')
    setMedecins(data || [])
    setForm({ nom: '', prenom: '', specialite: '', telephone: '', email: '' })
    setAfficherForm(false)
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Médecins</h1>
            <p className="text-slate-500 text-sm mt-1">{medecins.length} médecin(s) enregistré(s)</p>
          </div>
          <button onClick={() => setAfficherForm(!afficherForm)}
            className="bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
            + Nouveau médecin
          </button>
        </div>

        {afficherForm && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Ajouter un médecin</h2>
            {erreur && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{erreur}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Prénom *</label>
                <input name="prenom" value={form.prenom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Mamadou" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nom *</label>
                <input name="nom" value={form.nom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Diallo" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Spécialité</label>
                <input name="specialite" value={form.specialite} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Médecine générale" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Téléphone</label>
                <input name="telephone" value={form.telephone} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="77 000 00 00" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                <input name="email" value={form.email} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="medecin@clinique.com" />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSubmit} disabled={saving}
                className="bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
                {saving ? 'Enregistrement...' : 'Ajouter'}
              </button>
              <button onClick={() => setAfficherForm(false)}
                className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-medium">
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
          ) : medecins.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Aucun médecin enregistré.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Nom</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Spécialité</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Téléphone</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody>
                {medecins.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">Dr. {m.prenom} {m.nom}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{m.specialite}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{m.telephone}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{m.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Actif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}