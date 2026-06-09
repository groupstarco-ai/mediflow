'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Parametres() {
  const [utilisateurs, setUtilisateurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [afficherForm, setAfficherForm] = useState(false)
  const [recherche, setRecherche] = useState('')
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
    if (authError) { setErreur('Erreur lors de la création du compte.'); setSaving(false); return }
    const { error: dbError } = await supabase.from('utilisateurs').insert([{
      nom: form.nom, prenom: form.prenom, email: form.email, role: form.role, actif: true,
    }])
    if (dbError) { setErreur('Erreur lors de la création.'); setSaving(false); return }
    const { data } = await supabase.from('utilisateurs').select('*').order('created_at', { ascending: false })
    setUtilisateurs(data || [])
    setForm({ nom: '', prenom: '', email: '', role: 'gestionnaire', mot_de_passe: '' })
    setAfficherForm(false)
    setSaving(false)
  }

  const utilisateursFiltres = utilisateurs.filter(u =>
    `${u.prenom} ${u.nom} ${u.email} ${u.role}`.toLowerCase().includes(recherche.toLowerCase())
  )

  const roleConfig: any = {
    administrateur: { bg: 'bg-blue-50', text: 'text-blue-700', icone: '🛡️' },
    medecin: { bg: 'bg-green-50', text: 'text-green-700', icone: '🩺' },
    infirmier: { bg: 'bg-purple-50', text: 'text-purple-700', icone: '💉' },
    gestionnaire: { bg: 'bg-yellow-50', text: 'text-yellow-700', icone: '📋' },
    patient: { bg: 'bg-slate-50', text: 'text-slate-600', icone: '👤' },
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
            <p className="text-slate-500 text-sm mt-1">Gestion des utilisateurs et des accès</p>
          </div>
          <button onClick={() => setAfficherForm(!afficherForm)}
            className="bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
            + Nouvel utilisateur
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {Object.entries(roleConfig).map(([role, config]: any) => (
            <div key={role} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl mb-1">{config.icone}</p>
              <p className="text-xl font-bold text-slate-900">
                {utilisateurs.filter(u => u.role === role).length}
              </p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
          ))}
        </div>

        {afficherForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Créer un utilisateur</h2>
            {erreur && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{erreur}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Prénom *</label>
                <input name="prenom" value={form.prenom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Aminata" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nom *</label>
                <input name="nom" value={form.nom} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Diallo" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="utilisateur@mediflow.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Mot de passe *</label>
                <input name="mot_de_passe" type="password" value={form.mot_de_passe} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="••••••••••••" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Rôle *</label>
                <div className="grid grid-cols-4 gap-2">
                  {['gestionnaire', 'medecin', 'infirmier', 'administrateur'].map((r) => (
                    <label key={r} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === r ? 'border-blue-800 bg-blue-50' : 'border-slate-200'}`}>
                      <input type="radio" name="role" value={r} checked={form.role === r} onChange={handleChange} className="hidden" />
                      <span className="text-xl">{roleConfig[r]?.icone}</span>
                      <span className="text-xs font-medium text-slate-700 capitalize">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSubmit} disabled={saving}
                className="bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                {saving ? 'Création...' : 'Créer'}
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
            placeholder="Rechercher un utilisateur..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-slate-400 text-sm">Chargement...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilisateur</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rôle</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                </tr>
              </thead>
              <tbody>
                {utilisateursFiltres.map((u) => {
                  const r = roleConfig[u.role] || roleConfig.gestionnaire
                  return (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-800 font-semibold text-sm flex-shrink-0">
                            {u.prenom?.[0]}{u.nom?.[0]}
                          </div>
                          <p className="text-sm font-medium text-slate-800">{u.prenom} {u.nom}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${r.bg} ${r.text}`}>
                          {r.icone} {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.actif ? (
                          <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium">✓ Actif</span>
                        ) : (
                          <span className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full font-medium">✗ Inactif</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  )
}