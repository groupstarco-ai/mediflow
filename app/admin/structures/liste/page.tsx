'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Structure {
  id: string
  nom: string
  email: string
  telephone: string
  adresse: string
  plan_saas: string
  actif: boolean
  created_at: string
}

const planColors: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-700',
  clinique: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
}

const planPrix: Record<string, string> = {
  starter: '25 000 FCFA',
  clinique: '55 000 FCFA',
  pro: '95 000 FCFA',
}

export default function ListeStructuresPage() {
  const [structures, setStructures] = useState<Structure[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    chargerStructures()
  }, [])

  async function chargerStructures() {
    setLoading(true)
    const { data, error } = await supabase
      .from('structures')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setStructures(data)
    setLoading(false)
  }

  async function toggleActif(id: string, actuel: boolean) {
    const { error } = await supabase
      .from('structures')
      .update({ actif: !actuel })
      .eq('id', id)

    if (!error) chargerStructures()
  }

  const filtrees = structures.filter(s =>
    s.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    s.email.toLowerCase().includes(recherche.toLowerCase())
  )

  const totalMensuel = structures
    .filter(s => s.actif)
    .reduce((acc, s) => {
      const prix: Record<string, number> = {
        starter: 25000,
        clinique: 55000,
        pro: 95000
      }
      return acc + (prix[s.plan_saas] ?? 0)
    }, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Cliniques clientes</h1>
            <p className="text-gray-500 mt-1">Gestion de toutes les structures sur Maodo</p>
          </div>
          
            <button
            onClick={() => window.location.href = '/admin/structures'}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nouvelle clinique
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total cliniques</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{structures.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Cliniques actives</p>
            <p className="text-3xl font-semibold text-green-600 mt-1">
              {structures.filter(s => s.actif).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Revenus mensuels</p>
            <p className="text-3xl font-semibold text-blue-600 mt-1">
              {totalMensuel.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>

        {/* Recherche */}
        <div className="mb-4">
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher une clinique..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : filtrees.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Aucune clinique trouvée</div>
        ) : (
          <div className="space-y-3">
            {filtrees.map(structure => (
              <div
                key={structure.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Indicateur actif */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    structure.actif ? 'bg-green-400' : 'bg-gray-300'
                  }`} />

                  <div>
                    <p className="font-medium text-gray-900">{structure.nom}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {structure.email} · {structure.telephone}
                    </p>
                    <p className="text-sm text-gray-400">{structure.adresse}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Plan */}
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      planColors[structure.plan_saas] ?? 'bg-gray-100 text-gray-700'
                    }`}>
                      {structure.plan_saas?.toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {planPrix[structure.plan_saas] ?? '—'}/mois
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-right text-sm text-gray-400 min-w-24">
                    {new Date(structure.created_at).toLocaleDateString('fr-FR')}
                  </div>

                  {/* Bouton activer/désactiver */}
                  <button
                    onClick={() => toggleActif(structure.id, structure.actif)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      structure.actif
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {structure.actif ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}