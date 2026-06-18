'use client'

import { useState } from 'react'

interface FormData {
  nom: string
  email: string
  telephone: string
  adresse: string
  plan: 'starter' | 'clinique' | 'pro'
  adminEmail: string
  adminPassword: string
  adminNom: string
  adminPrenom: string
}

const initialForm: FormData = {
  nom: '',
  email: '',
  telephone: '',
  adresse: '',
  plan: 'clinique',
  adminEmail: '',
  adminPassword: '',
  adminNom: '',
  adminPrenom: '',
}

export default function NouvelleStructurePage() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/structures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPER_ADMIN_KEY}`,
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setResult({ success: true, message: data.message })
      setForm(initialForm)

    } catch (error: any) {
      setResult({ success: false, message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Nouvelle clinique cliente</h1>
          <p className="text-gray-500 mt-1">Créer un espace isolé pour une nouvelle structure médicale</p>
        </div>

        {result && (
          <div className={`mb-6 p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {result.message}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Informations de la clinique</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nom de la clinique</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Ex: Clinique Pasteur Dakar"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contact@clinique.sn"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Téléphone</label>
                <input
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="77 123 45 67"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Adresse</label>
              <input
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                placeholder="Quartier, Ville"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Offre</label>
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="starter">Starter — 25 000 FCFA/mois</option>
                <option value="clinique">Clinique — 55 000 FCFA/mois</option>
                <option value="pro">Pro — 95 000 FCFA/mois</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Compte administrateur de la clinique</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nom</label>
                <input
                  name="adminNom"
                  value={form.adminNom}
                  onChange={handleChange}
                  placeholder="Diallo"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prénom</label>
                <input
                  name="adminPrenom"
                  value={form.adminPrenom}
                  onChange={handleChange}
                  placeholder="Mamadou"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email de connexion</label>
              <input
                name="adminEmail"
                type="email"
                value={form.adminEmail}
                onChange={handleChange}
                placeholder="admin@clinique.sn"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mot de passe provisoire</label>
              <input
                name="adminPassword"
                type="password"
                value={form.adminPassword}
                onChange={handleChange}
                placeholder="Minimum 8 caractères"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Création en cours...' : 'Créer la clinique'}
        </button>

      </div>
    </div>
  )
}