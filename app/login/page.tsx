'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const MAX_TENTATIVES = 3
const DUREE_BLOCAGE = 30 * 60 * 1000

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verifierBlocage = () => {
    const bloque = localStorage.getItem('mediflow_bloque')
    const tentatives = parseInt(localStorage.getItem('mediflow_tentatives') || '0')
    const tempsBlocage = parseInt(localStorage.getItem('mediflow_temps_blocage') || '0')

    if (bloque && Date.now() < tempsBlocage + DUREE_BLOCAGE) {
      const restant = Math.ceil((tempsBlocage + DUREE_BLOCAGE - Date.now()) / 60000)
      setError(`Compte bloqué. Réessayez dans ${restant} minute(s).`)
      return true
    }

    if (bloque && Date.now() >= tempsBlocage + DUREE_BLOCAGE) {
      localStorage.removeItem('mediflow_bloque')
      localStorage.removeItem('mediflow_tentatives')
      localStorage.removeItem('mediflow_temps_blocage')
    }

    return false
  }

  const handleLogin = async () => {
    if (verifierBlocage()) return

    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      const tentatives = parseInt(localStorage.getItem('mediflow_tentatives') || '0') + 1
      localStorage.setItem('mediflow_tentatives', tentatives.toString())

      if (tentatives >= MAX_TENTATIVES) {
        localStorage.setItem('mediflow_bloque', 'true')
        localStorage.setItem('mediflow_temps_blocage', Date.now().toString())
        setError('Trop de tentatives échouées. Compte bloqué 30 minutes.')
      } else {
        setError(`Email ou mot de passe incorrect. ${MAX_TENTATIVES - tentatives} tentative(s) restante(s).`)
      }

      setLoading(false)
      return
    }

    localStorage.removeItem('mediflow_tentatives')
    localStorage.removeItem('mediflow_bloque')
    localStorage.removeItem('mediflow_temps_blocage')

    const { data: utilisateur } = await supabase
      .from('utilisateurs')
      .select('role')
      .eq('email', email)
      .single()

    if (!utilisateur) {
      window.location.href = '/dashboard'
      return
    }

    switch (utilisateur.role) {
      case 'administrateur':
        window.location.href = '/dashboard'
        break
      case 'medecin':
        window.location.href = '/dashboard'
        break
      case 'infirmier':
        window.location.href = '/dashboard'
        break
      case 'gestionnaire':
        window.location.href = '/dashboard'
        break
      default:
        window.location.href = '/dashboard'
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-8 w-full max-w-md">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-800 rounded-lg"></div>
          <span className="font-semibold text-slate-800 text-lg">MediFlow</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Connexion</h1>
        <p className="text-slate-500 text-sm mb-8">Accédez à votre espace médical sécurisé</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
            />
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm text-blue-800">Mot de passe oublié ?</a>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium mt-2"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

      </div>
    </main>
  )
}