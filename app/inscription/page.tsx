'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Inscription() {
  const [etape, setEtape] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  const [structure, setStructure] = useState({
    nom: '',
    type: 'clinique',
    adresse: '',
    telephone: '',
    email: '',
  })

  const [admin, setAdmin] = useState({
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
    confirmer_mot_de_passe: '',
  })

  const handleStructureChange = (e: any) => {
    setStructure({ ...structure, [e.target.name]: e.target.value })
  }

  const handleAdminChange = (e: any) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value })
  }

  const validerEtape1 = () => {
    if (!structure.nom || !structure.adresse || !structure.telephone || !structure.email) {
      setErreur('Tous les champs de la structure sont obligatoires.')
      return
    }
    setErreur('')
    setEtape(2)
  }

  const handleSubmit = async () => {
    if (!admin.prenom || !admin.nom || !admin.email || !admin.mot_de_passe) {
      setErreur('Tous les champs administrateur sont obligatoires.')
      return
    }
    if (admin.mot_de_passe !== admin.confirmer_mot_de_passe) {
      setErreur('Les mots de passe ne correspondent pas.')
      return
    }
    if (admin.mot_de_passe.length < 12) {
      setErreur('Le mot de passe doit contenir au moins 12 caractères.')
      return
    }
    setLoading(true)
    setErreur('')

    // 1. Créer la structure
    const { data: nouvelleStructure, error: erreurStructure } = await supabase
      .from('structures')
      .insert([{
        nom: structure.nom,
        type: structure.type,
        adresse: structure.adresse,
        telephone: structure.telephone,
        email: structure.email,
      }])
      .select()
      .single()

    if (erreurStructure) {
      setErreur('Erreur structure: ' + erreurStructure.message)
      setLoading(false)
      return
    }

    // 2. Créer le compte auth
    const { data: authData, error: erreurAuth } = await supabase.auth.signUp({
      email: admin.email,
      password: admin.mot_de_passe,
    })

    if (erreurAuth) {
      console.error('ERREUR AUTH COMPLETE:', erreurAuth)
      setErreur('Erreur auth: ' + JSON.stringify(erreurAuth))
      setLoading(false)
      return
    }

    // 3. Créer l'utilisateur dans la table utilisateurs
    const { error: erreurUtilisateur } = await supabase
      .from('utilisateurs')
      .insert([{
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
        role: 'administrateur',
        structure_id: nouvelleStructure.id,
        actif: true,
        auth_id: authData?.user?.id,
      }])

    if (erreurUtilisateur) {
      console.error('ERREUR UTILISATEUR COMPLETE:', erreurUtilisateur)
    }

    if (erreurUtilisateur) {
      setErreur('Erreur lors de la création du compte administrateur.')
      setLoading(false)
      return
    }

    setSucces(true)
    setLoading(false)
  }

  if (succes) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Inscription réussie !</h1>
          <p className="text-slate-500 text-sm mb-6">
            Votre structure <strong>{structure.nom}</strong> a été créée. Vérifiez votre email pour confirmer votre compte.
          </p>
          <a href="/login"
            className="bg-blue-800 text-white px-6 py-3 rounded-xl text-sm font-medium block">
            Se connecter
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 bg-blue-800 rounded-lg"></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Maodo</h1>
          <p className="text-blue-200 text-sm">Inscription de votre structure médicale</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center gap-2 flex-1 ${etape === 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${etape >= 1 ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
              <span className="text-sm font-medium text-slate-700">Structure</span>
            </div>
            <div className="h-px flex-1 bg-slate-200"></div>
            <div className={`flex items-center gap-2 flex-1 ${etape === 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${etape >= 2 ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
              <span className="text-sm font-medium text-slate-700">Administrateur</span>
            </div>
          </div>

          {erreur && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {erreur}
            </div>
          )}

          {etape === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Informations de la structure</h2>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nom de la structure *</label>
                <input name="nom" value={structure.nom} onChange={handleStructureChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Clinique Pasteur, Cabinet Dr. Fall..." />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Type de structure *</label>
                <select name="type" value={structure.type} onChange={handleStructureChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="clinique">Clinique privée</option>
                  <option value="cabinet">Cabinet médical</option>
                  <option value="hopital">Hôpital</option>
                  <option value="centre_sante">Centre de santé</option>
                  <option value="polyclinique">Polyclinique</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Adresse *</label>
                <input name="adresse" value={structure.adresse} onChange={handleStructureChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Rue 10, Plateau, Dakar" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Téléphone *</label>
                <input name="telephone" value={structure.telephone} onChange={handleStructureChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="77 000 00 00" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
                <input name="email" type="email" value={structure.email} onChange={handleStructureChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="contact@clinique.sn" />
              </div>

              <button onClick={validerEtape1}
                className="w-full bg-blue-800 text-white py-3 rounded-xl text-sm font-semibold mt-2">
                Continuer →
              </button>
            </div>
          )}

          {etape === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Compte administrateur</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Prénom *</label>
                  <input name="prenom" value={admin.prenom} onChange={handleAdminChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                    placeholder="Cheikh" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Nom *</label>
                  <input name="nom" value={admin.nom} onChange={handleAdminChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                    placeholder="Badiane" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
                <input name="email" type="email" value={admin.email} onChange={handleAdminChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="admin@clinique.sn" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Mot de passe * (12 caractères min)</label>
                <input name="mot_de_passe" type="password" value={admin.mot_de_passe} onChange={handleAdminChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="••••••••••••" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Confirmer le mot de passe *</label>
                <input name="confirmer_mot_de_passe" type="password" value={admin.confirmer_mot_de_passe} onChange={handleAdminChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="••••••••••••" />
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setEtape(1)}
                  className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-medium">
                  ← Retour
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-blue-800 text-white py-3 rounded-xl text-sm font-semibold">
                  {loading ? 'Création...' : 'Créer mon compte'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Déjà inscrit ? <a href="/login" className="text-blue-800 font-medium">Se connecter</a>
            </p>
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">© 2026 Maodo — Tous droits réservés</p>
      </div>
    </main>
  )
}