'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Parametres() {
  const [utilisateurs, setUtilisateurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [afficherForm, setAfficherForm] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', role: 'gestionnaire', mot_de_passe: '' })
  const [erreur, setErreur] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('utilisateurs').select('*').order('created_at', { ascending: false })
      setUtilisateurs(data || [])
      setLoading(false)
    }
    charger()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.mot_de_passe) {
      setErreur('Tous les champs sont obligatoires.')
      return
    }
    setSaving(true)
    setErreur('')

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.mot_de_passe,
    })

    if (authError) {
      setErreur('Erreur lors de la création du compte.')
      setSaving(false)
      return
    }

    const { error: dbError } = await supabase.from('utilisateurs').insert([{
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      role: form.role,
      actif: true,
    }])

    if (dbError) {
      setErreur('Erreur lors de la création de l utilisateur.')
      setSaving(false)
      return
    }

    const { data } = await supabase.from('utilisateurs').select('*').order('created_at', { ascending: false })
    setUtilisateurs(data || [])
    setForm({ nom: '', prenom: '', email: '', role: 'gestionnaire', mot_de_passe: '' })
    setAfficherForm(false)
    setSaving(false)
  }

  const roleCouleur = (role: string) => {
    switch (role) {
      case 'administrateur': return 'bg-blue-50 text-blue-700'
      case 'medecin': return 'bg-green-50 text-green-700'
      case 'infirmier': return 'bg-purple-50 text-purple-700'
      case 'gestionnaire': return 'bg-yellow-50 text-yellow-700'
      case 'patient': return 'bg-slate-50 text-slate-600'
      default: return 'bg-slate-50 text-slate-600'
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
            <p className="text-slate-500 text-sm mt-1">Gestion des utilisateurs et des accès</p>
          </div>
          <button onClick={() => setAfficherForm(!afficherForm)}
            className="bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
            + Nouvel utilisateur
          </button>
        </div>

        {afficherForm && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Créer un utilisateur</h2>
            {erreur && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{erreur}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Prénom *</label>
                <input name="prenom" value={form.prenom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Aminata" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nom *</label>
                <input name="nom" value={form.nom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Diallo" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="utilisateur@mediflow.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Mot de passe *</label>
                <input name="mot_de_passe" type="password" value={form.mot_de_passe} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="••••••••••••" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Rôle *</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="medecin">Médecin</option>
                  <option value="infirmier">Infirmier</option>
                  <option value="administrateur">Administrateur</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSubmit} disabled={saving}
                className="bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
                {saving ? 'Création...' : 'Créer'}
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
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Utilisateur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Rôle</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{u.prenom} {u.nom}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${roleCouleur(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      {u.actif ? (
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Actif</span>
                      ) : (
                        <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Inactif</span>
                      )}
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