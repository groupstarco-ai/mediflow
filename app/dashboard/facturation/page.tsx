'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Facturation() {
  const [factures, setFactures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [afficherForm, setAfficherForm] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
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
    const nouvelleFacture = {
      id: noFacture,
      patient: patients.find(p => p.id === form.patient_id),
      montant: parseFloat(form.montant),
      description: form.description,
      statut: form.statut,
      mode_paiement: form.mode_paiement,
      date: new Date().toLocaleDateString('fr-FR'),
    }
    setFactures([nouvelleFacture, ...factures])
    setForm({ patient_id: '', montant: '', description: '', statut: 'en_attente', mode_paiement: 'especes' })
    setAfficherForm(false)
    setSaving(false)
  }

  const totalEncaisse = factures.filter(f => f.statut === 'paye').reduce((acc, f) => acc + f.montant, 0)
  const totalEnAttente = factures.filter(f => f.statut === 'en_attente').reduce((acc, f) => acc + f.montant, 0)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Facturation</h1>
            <p className="text-slate-500 text-sm mt-1">{factures.length} facture(s)</p>
          </div>
          <button onClick={() => setAfficherForm(!afficherForm)}
            className="bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
            + Nouvelle facture
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">Total encaissé</p>
            <p className="text-2xl font-bold text-green-600">{totalEncaisse.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">{totalEnAttente.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-1">Total factures</p>
            <p className="text-2xl font-bold text-slate-900">{factures.length}</p>
          </div>
        </div>

        {afficherForm && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Créer une facture</h2>
            {erreur && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{erreur}</div>}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Patient *</label>
                <select name="patient_id" value={form.patient_id} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="">Choisir un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
                <input name="description" value={form.description} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="Consultation générale, analyses..." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Montant (FCFA) *</label>
                <input name="montant" type="number" value={form.montant} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800"
                  placeholder="5000" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Mode de paiement</label>
                <select name="mode_paiement" value={form.mode_paiement} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money (Wave / Orange Money)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Statut</label>
                <select name="statut" value={form.statut} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-800">
                  <option value="en_attente">En attente</option>
                  <option value="paye">Payé</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSubmit} disabled={saving}
                className="bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
                {saving ? 'Création...' : 'Créer la facture'}
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
          ) : factures.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Aucune facture pour le moment.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">N° Facture</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Patient</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Description</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Montant</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Mode</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((f) => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{f.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{f.patient?.prenom} {f.patient?.nom}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{f.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{f.montant.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      {f.mode_paiement === 'mobile_money' ? (
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">📱 Mobile</span>
                      ) : (
                        <span className="bg-slate-50 text-slate-600 text-xs px-2 py-1 rounded-full">💵 Espèces</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{f.date}</td>
                    <td className="px-6 py-4">
                      {f.statut === 'paye' ? (
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Payé</span>
                      ) : (
                        <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full">En attente</span>
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