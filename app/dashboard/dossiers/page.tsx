'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'
import ProtegerPage from '../../components/ProtegerPage'
import { getUserRole } from '@/lib/permissions'

export default function Dossiers() {
  const [dossiers, setDossiers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [role, setRole] = useState<string>('')
  const [medecinId, setMedecinId] = useState<string | null>(null)
  const [dossierProtege, setDossierProtege] = useState<any>(null)
  const [codePin, setCodePin] = useState('')
  const [erreurPin, setErreurPin] = useState('')
  const [dossiersDebloques, setDossiersDebloques] = useState<string[]>([])

  useEffect(() => {
    const getDossiers = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const r = await getUserRole()
      setRole(r || '')

      if (r === 'medecin') {
        const { data: util } = await supabase.from('utilisateurs').select('id').eq('email', user.email).single()
        const { data: med } = await supabase.from('medecins').select('id').eq('utilisateur_id', util?.id).single()
        setMedecinId(med?.id || null)
      }

      const { data } = await supabase
        .from('dossiers_medicaux')
        .select('*, patients(nom, prenom), medecins(nom, prenom, id, code_acces)')
        .order('date_consultation', { ascending: false })
      setDossiers(data || [])
      setLoading(false)
    }
    getDossiers()
  }, [])

  const verifierPin = async () => {
    if (!dossierProtege) return
    const codeAttendu = dossierProtege.medecins?.code_acces
    if (codePin === codeAttendu) {
      setDossiersDebloques([...dossiersDebloques, dossierProtege.medecins?.id])
      setDossierProtege(null)
      setCodePin('')
      setErreurPin('')
    } else {
      setErreurPin('Code incorrect. Réessayez.')
      setCodePin('')
    }
  }

  const estMedecinDossier = (d: any) => d.medecins?.id === medecinId
  const estDebloque = (d: any) => dossiersDebloques.includes(d.medecins?.id)
  const peutVoir = (d: any) => role !== 'medecin' || estMedecinDossier(d) || estDebloque(d)

  const dossiersFiltres = dossiers.filter(d => {
    const matchRecherche = `${d.patients?.prenom} ${d.patients?.nom} ${d.diagnostic}`.toLowerCase().includes(recherche.toLowerCase())
    const matchFiltre = filtre === 'tous' || (filtre === 'standard' && d.niveau_confidentialite === 1) || (filtre === 'confidentiel' && d.niveau_confidentialite === 2)
    return matchRecherche && matchFiltre
  })

  const stats = {
    total: dossiers.length,
    standard: dossiers.filter(d => d.niveau_confidentialite === 1).length,
    confidentiel: dossiers.filter(d => d.niveau_confidentialite === 2).length,
    mesDossiers: role === 'medecin' ? dossiers.filter(d => estMedecinDossier(d)).length : 0,
  }

  return (
    <ProtegerPage module="dossiers">
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 px-8 py-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dossiers médicaux</h1>
              <p className="text-slate-500 text-sm mt-1">{dossiers.length} dossier(s)</p>
            </div>
            <a href="/dashboard/dossiers/nouveau"
              className="bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
              + Nouveau dossier
            </a>
          </div>

          {role === 'medecin' && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">🩺</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Mode Médecin</p>
                <p className="text-xs text-green-600">Vous voyez vos dossiers directement. Pour accéder aux dossiers d'un confrère, un code PIN est requis.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">📋</div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500">Total dossiers</p>
              </div>
            </div>
            {role === 'medecin' ? (
              <div className="bg-green-50 rounded-2xl border border-green-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">🩺</div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{stats.mesDossiers}</p>
                  <p className="text-xs text-slate-500">Mes dossiers</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg">✅</div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{stats.standard}</p>
                  <p className="text-xs text-slate-500">Standard</p>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-lg">🔒</div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.confidentiel}</p>
                <p className="text-xs text-slate-500">Confidentiels</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 px-4 py-3 flex items-center gap-4">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par patient ou diagnostic..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
            />
            <div className="flex gap-2">
              {['tous', 'standard', 'confidentiel'].map((f) => (
                <button key={f} onClick={() => setFiltre(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                    filtre === f ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {f === 'tous' ? 'Tous' : f === 'standard' ? '✅ Standard' : '🔒 Confidentiel'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">⏳</p>
                <p className="text-slate-400 text-sm">Chargement...</p>
              </div>
            ) : dossiersFiltres.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-slate-400 text-sm">Aucun dossier trouvé.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Médecin</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Diagnostic</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Confidentialité</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dossiersFiltres.map((d) => {
                    const visible = peutVoir(d)
                    const estMonDossier = estMedecinDossier(d)
                    return (
                      <tr key={d.id} className={`border-b border-slate-50 transition-colors ${!visible ? 'bg-slate-50 opacity-70' : 'hover:bg-blue-50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-800 font-semibold text-sm flex-shrink-0">
                              {d.patients?.prenom?.[0]}{d.patients?.nom?.[0]}
                            </div>
                            <p className="text-sm font-medium text-slate-800">{d.patients?.prenom} {d.patients?.nom}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            Dr. {d.medecins?.prenom} {d.medecins?.nom}
                            {estMonDossier && <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">Moi</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700">{new Date(d.date_consultation).toLocaleDateString('fr-FR')}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                          {!visible ? (
                            <span className="text-slate-400 italic text-xs">🔐 Accès restreint</span>
                          ) : d.niveau_confidentialite === 2 ? (
                            <span className="text-red-400 italic text-xs">🔒 Contenu confidentiel</span>
                          ) : (
                            <span className="truncate block">{d.diagnostic}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {d.niveau_confidentialite === 1 ? (
                            <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium">✓ Standard</span>
                          ) : (
                            <span className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full font-medium">🔒 Confidentiel</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!visible ? (
                            <button onClick={() => { setDossierProtege(d); setCodePin(''); setErreurPin('') }}
                              className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-yellow-100 transition-colors">
                              🔐 Saisir le code
                            </button>
                          ) : (
                            <a href={`/dashboard/dossiers/${d.id}/modifier`}
                              className="bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                              ✏️ Modifier
                            </a>
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

      {dossierProtege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <p className="text-4xl mb-2">🔐</p>
              <h2 className="text-lg font-bold text-slate-900">Code d'accès requis</h2>
              <p className="text-slate-500 text-sm mt-1">
                Dossiers de Dr. {dossierProtege.medecins?.prenom} {dossierProtege.medecins?.nom}
              </p>
            </div>
            {erreurPin && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 text-center">
                ❌ {erreurPin}
              </div>
            )}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block text-center">Code PIN à 4 chiffres</label>
              <input
                type="password"
                maxLength={4}
                value={codePin}
                onChange={(e) => setCodePin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifierPin()}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none focus:border-blue-800"
                placeholder="••••"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={verifierPin} disabled={codePin.length !== 4}
                className="flex-1 bg-blue-800 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
                Valider
              </button>
              <button onClick={() => { setDossierProtege(null); setCodePin(''); setErreurPin('') }}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </ProtegerPage>
  )
}