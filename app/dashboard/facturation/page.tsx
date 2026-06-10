'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Facturation() {
  const [factures, setFactures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [afficherForm, setAfficherForm] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [form, setForm] = useState({
    patient_id: '',
    montant: '',
    description: '',
    statut: 'en_attente',
    mode_paiement: 'especes',
  })
  const [erreur, setErreur] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: p } = await supabase.from('patients').select('id, nom, prenom')
      setPatients(p || [])
      const { data: f } = await supabase
        .from('factures')
        .select('*, patients(nom, prenom)')
        .order('created_at', { ascending: false })
      setFactures(f || [])
      setLoading(false)
    }
    charger()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.patient_id || !form.montant || !form.description) {
      setErreur('Patient, montant et description sont obligatoires.')
      return
    }
    setSaving(true)
    setErreur('')
    const noFacture = `FAC-${Date.now()}`
    const { error } = await supabase.from('factures').insert([{
      id: noFacture,
      patient_id: form.patient_id,
      montant: parseFloat(form.montant),
      description: form.description,
      statut: form.statut,
      mode_paiement: form.mode_paiement,
    }])
    if (error) {
      setErreur('Erreur lors de la création de la facture.')
      setSaving(false)
      return
    }
    const { data: f } = await supabase
      .from('factures')
      .select('*, patients(nom, prenom)')
      .order('created_at', { ascending: false })
    setFactures(f || [])
    setForm({ patient_id: '', montant: '', description: '', statut: 'en_attente', mode_paiement: 'especes' })
    setAfficherForm(false)
    setSaving(false)
  }

  const facturesFiltrees = factures.filter(f => {
    const matchRecherche = `${f.patients?.prenom} ${f.patients?.nom} ${f.description}`.toLowerCase().includes(recherche.toLowerCase())
    const matchFiltre = filtre === 'tous' || f.statut === filtre
    return matchRecherche && matchFiltre
  })

  const totalEncaisse = factures.filter(f => f.statut === 'paye').reduce((acc, f) => acc + f.montant, 0)
  const totalEnAttente = factures.filter(f => f.statut === 'en_attente').reduce((acc, f) => acc + f.montant, 0)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Facturation</h1>
            <p className="text-slate-500 text-sm mt-1">{factures.length} facture(s)</p>
          </div>
          <button onClick={() => setAfficherForm(!afficherForm)}
            className="bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
            + Nouvelle facture
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-100">Total encaissé</p>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalEncaisse.toLocaleString()} FCFA</p>
            <p className="text-xs text-green-200 mt-1">{factures.filter(f => f.statut === 'paye').length} facture(s) payée(s)</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">En attente</p>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{totalEnAttente.toLocaleString()} FCFA</p>
            <p className="text-xs text-slate-400 mt-1">{factures.filter(f => f.statut === 'en_attente').length} facture(s) en attente</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total factures</p>
              <span className="text-2xl">🧾</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{factures.length}</p>
            <p className="text-xs text-slate-400 mt-1">Ce mois</p>
          </div>
        </div>

        {afficherForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Créer une facture</h2>
            {erreur && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{erreur}</div>}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Patient *</label>
                <select name="patient_id" value={form.patient_id} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="">Choisir un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
                <input name="description" value={form.description} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Consultation générale, analyses..." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Montant (FCFA) *</label>
                <input name="montant" type="number" value={form.montant} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="5000" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Mode de paiement</label>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.mode_paiement === 'especes' ? 'border-blue-800 bg-blue-50' : 'border-slate-200'}`}>
                    <input type="radio" name="mode_paiement" value="especes" checked={form.mode_paiement === 'especes'} onChange={handleChange} className="hidden" />
                    <span className="text-xl">💵</span>
                    <span className="text-sm font-medium text-slate-700">Espèces</span>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.mode_paiement === 'mobile_money' ? 'border-blue-800 bg-blue-50' : 'border-slate-200'}`}>
                    <input type="radio" name="mode_paiement" value="mobile_money" checked={form.mode_paiement === 'mobile_money'} onChange={handleChange} className="hidden" />
                    <span className="text-xl">📱</span>
                    <span className="text-sm font-medium text-slate-700">Mobile Money</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Statut</label>
                <select name="statut" value={form.statut} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="en_attente">En attente</option>
                  <option value="paye">Payé</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSubmit} disabled={saving}
                className="bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                {saving ? 'Création...' : 'Créer la facture'}
              </button>
              <button onClick={() => setAfficherForm(false)}
                className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-medium">
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 px-4 py-3 flex items-center gap-4">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par patient ou description..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
          />
          <div className="flex gap-2">
            {['tous', 'en_attente', 'paye'].map((f) => (
              <button key={f} onClick={() => setFiltre(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filtre === f ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {f === 'tous' ? 'Tous' : f === 'paye' ? '✅ Payé' : '⏳ En attente'}
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
          ) : facturesFiltrees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-slate-400 text-sm">Aucune facture pour le moment.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">N° Facture</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Montant</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                </tr>
              </thead>
              <tbody>
                {facturesFiltrees.map((f) => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{f.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800 font-semibold text-xs">
                          {f.patients?.prenom?.[0]}{f.patients?.nom?.[0]}
                        </div>
                        <span className="text-sm text-slate-700">{f.patients?.prenom} {f.patients?.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{f.description}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{f.montant.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      {f.mode_paiement === 'mobile_money' ? (
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">📱 Mobile</span>
                      ) : (
                        <span className="bg-slate-50 text-slate-600 text-xs px-2 py-1 rounded-full">💵 Espèces</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(f.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      {f.statut === 'paye' ? (
                        <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium">✅ Payé</span>
                      ) : (
                        <span className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">⏳ En attente</span>
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