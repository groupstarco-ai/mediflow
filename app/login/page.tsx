'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { enregistrerAction } from '@/lib/audit'

const MAX_TENTATIVES = 3
const DUREE_BLOCAGE = 30 * 60 * 1000

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [estBloque, setEstBloque] = useState(false)
  const [minutesRestantes, setMinutesRestantes] = useState(0)
  const [secondesRestantes, setSecondesRestantes] = useState(0)
  const [tentatives, setTentatives] = useState(0)

  useEffect(() => {
    verifierBlocageInitial()
  }, [])

  useEffect(() => {
    if (!estBloque) return
    const interval = setInterval(() => {
      const tempsBlocage = parseInt(localStorage.getItem('mediflow_temps_blocage') || '0')
      const restantMs = tempsBlocage + DUREE_BLOCAGE - Date.now()
      if (restantMs <= 0) {
        localStorage.removeItem('mediflow_bloque')
        localStorage.removeItem('mediflow_tentatives')
        localStorage.removeItem('mediflow_temps_blocage')
        setEstBloque(false)
        setError('')
        setTentatives(0)
        clearInterval(interval)
      } else {
        setMinutesRestantes(Math.floor(restantMs / 60000))
        setSecondesRestantes(Math.floor((restantMs % 60000) / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [estBloque])

  const verifierBlocageInitial = () => {
    const bloque = localStorage.getItem('mediflow_bloque')
    const tempsBlocage = parseInt(localStorage.getItem('mediflow_temps_blocage') || '0')
    const t = parseInt(localStorage.getItem('mediflow_tentatives') || '0')
    setTentatives(t)

    if (bloque && Date.now() < tempsBlocage + DUREE_BLOCAGE) {
      const restantMs = tempsBlocage + DUREE_BLOCAGE - Date.now()
      setEstBloque(true)
      setMinutesRestantes(Math.floor(restantMs / 60000))
      setSecondesRestantes(Math.floor((restantMs % 60000) / 1000))
      return true
    }

    if (bloque && Date.now() >= tempsBlocage + DUREE_BLOCAGE) {
      localStorage.removeItem('mediflow_bloque')
      localStorage.removeItem('mediflow_tentatives')
      localStorage.removeItem('mediflow_temps_blocage')
      setEstBloque(false)
      setTentatives(0)
    }
    return false
  }

  const handleLogin = async () => {
    if (verifierBlocageInitial()) return
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      const nouvellesTentatives = tentatives + 1
      setTentatives(nouvellesTentatives)
      localStorage.setItem('mediflow_tentatives', nouvellesTentatives.toString())

      if (nouvellesTentatives >= MAX_TENTATIVES) {
        localStorage.setItem('mediflow_bloque', 'true')
        localStorage.setItem('mediflow_temps_blocage', Date.now().toString())
        setEstBloque(true)
        setMinutesRestantes(30)
        setSecondesRestantes(0)
      } else {
        setError(`Email ou mot de passe incorrect. ${MAX_TENTATIVES - nouvellesTentatives} tentative(s) restante(s).`)
      }
      setLoading(false)
      return
    }

    localStorage.removeItem('mediflow_tentatives')
    localStorage.removeItem('mediflow_bloque')
    localStorage.removeItem('mediflow_temps_blocage')
    await enregistrerAction('connexion', 'auth', `Connexion réussie: ${email}`)
    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 bg-blue-800 rounded-lg"></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">MediFlow</h1>
          <p className="text-blue-200 text-sm">Plateforme de gestion médicale sécurisée</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Connexion</h2>
          <p className="text-slate-500 text-sm mb-6">Accédez à votre espace médical</p>

          {estBloque ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-4xl mb-3">🔒</p>
              <p className="text-red-700 font-semibold text-sm mb-1">Compte temporairement bloqué</p>
              <p className="text-red-500 text-xs mb-4">Trop de tentatives de connexion échouées</p>
              <div className="bg-red-100 rounded-xl p-4 mb-4">
                <p className="text-xs text-red-600 mb-1">Temps restant avant déblocage</p>
                <p className="text-3xl font-bold text-red-700 font-mono">
                  {String(minutesRestantes).padStart(2, '0')}:{String(secondesRestantes).padStart(2, '0')}
                </p>
              </div>
              <p className="text-xs text-slate-400">Si vous avez oublié votre mot de passe, contactez l'administrateur</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span>⚠️</span>
                    <span className="font-medium">{error}</span>
                  </div>
                  {tentatives > 0 && tentatives < MAX_TENTATIVES && (
                    <div className="flex gap-1 mt-2">
                      {[...Array(MAX_TENTATIVES)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < tentatives ? 'bg-red-500' : 'bg-red-200'}`}></div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Adresse email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✉️</span>
                    <input
                      type="email"
                      placeholder="vous@clinique.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Mot de passe</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-600 text-white py-3 rounded-xl text-sm font-semibold shadow-lg hover:opacity-90 transition-all">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Connexion en cours...
                    </span>
                  ) : 'Se connecter'}
                </button>
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">🔐 Connexion sécurisée — Données médicales protégées</p>
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">© 2026 MediFlow — Tous droits réservés</p>
      </div>
    </main>
  )
}