'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '../../../components/Sidebar'

function calculerAge(dateNaissance: string) {
  if (!dateNaissance) return null
  const naissance = new Date(dateNaissance)
  const aujourd_hui = new Date()
  let age = aujourd_hui.getFullYear() - naissance.getFullYear()
  const m = aujourd_hui.getMonth() - naissance.getMonth()
  if (m < 0 || (m === 0 && aujourd_hui.getDate() < naissance.getDate())) age--
  return age
}

export default function DetailPatient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [patient, setPatient] = useState<any>(null)
  const [dossiers, setDossiers] = useState<any[]>([])
  const [rdvs, setRdvs] = useState<any[]>([])
  const [constantes, setConstantes] = useState<any[]>([])
  const [structure, setStructure] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [afficherConstantes, setAfficherConstantes] = useState(false)
  const [formConstantes, setFormConstantes] = useState({
    poids: '', taille: '', tension_systolique: '', tension_diastolique: '',
    temperature: '', pouls: '', saturation: '', glycemie: '', observations: '',
  })
  const [savingConstantes, setSavingConstantes] = useState(false)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: p } = await supabase.from('patients').select('*').eq('id', id).single()
      setPatient(p)
      const { data: d } = await supabase.from('dossiers_medicaux').select('*, medecins(nom, prenom)').eq('patient_id', id).order('date_consultation', { ascending: false })
      setDossiers(d || [])
      const { data: r } = await supabase.from('rendez_vous').select('*, medecins(nom, prenom)').eq('patient_id', id).order('date_heure', { ascending: false })
      setRdvs(r || [])
      const { data: c } = await supabase.from('constantes_vitales').select('*').eq('patient_id', id).order('created_at', { ascending: false })
      setConstantes(c || [])
      const { data: s } = await supabase.from('structures').select('*').limit(1).single()
      setStructure(s)
      setLoading(false)
    }
    charger()
  }, [id])

  const handleConstantesChange = (e: any) => {
    setFormConstantes({ ...formConstantes, [e.target.name]: e.target.value })
  }

  const sauvegarderConstantes = async () => {
    setSavingConstantes(true)
    await supabase.from('constantes_vitales').insert([{
      patient_id: id,
      poids: formConstantes.poids ? parseFloat(formConstantes.poids) : null,
      taille: formConstantes.taille ? parseFloat(formConstantes.taille) : null,
      tension_systolique: formConstantes.tension_systolique ? parseInt(formConstantes.tension_systolique) : null,
      tension_diastolique: formConstantes.tension_diastolique ? parseInt(formConstantes.tension_diastolique) : null,
      temperature: formConstantes.temperature ? parseFloat(formConstantes.temperature) : null,
      pouls: formConstantes.pouls ? parseInt(formConstantes.pouls) : null,
      saturation: formConstantes.saturation ? parseInt(formConstantes.saturation) : null,
      glycemie: formConstantes.glycemie ? parseFloat(formConstantes.glycemie) : null,
      observations: formConstantes.observations,
    }])
    const { data: c } = await supabase.from('constantes_vitales').select('*').eq('patient_id', id).order('created_at', { ascending: false })
    setConstantes(c || [])
    setFormConstantes({ poids: '', taille: '', tension_systolique: '', tension_diastolique: '', temperature: '', pouls: '', saturation: '', glycemie: '', observations: '' })
    setAfficherConstantes(false)
    setSavingConstantes(false)
  }

  const imprimerFiche = () => {
    const dernieresConstantes = constantes[0]
    const contenu = `
      <html>
      <head>
        <title>Fiche patient — ${patient?.prenom} ${patient?.nom}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; color: #1e293b; font-size: 11px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 16px; }
          .structure h1 { font-size: 16px; color: #1e3a5f; margin: 0 0 3px; }
          .structure p { margin: 1px 0; font-size: 10px; color: #64748b; }
          .titre-fiche { text-align: right; }
          .titre-fiche h2 { font-size: 18px; color: #1e3a5f; margin: 0; }
          .titre-fiche p { font-size: 10px; color: #64748b; margin: 1px 0; }
          .section { margin-bottom: 14px; }
          .section-title { font-size: 10px; font-weight: bold; color: #1e3a5f; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
          .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; }
          .info-item { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #e2e8f0; }
          .info-label { color: #64748b; }
          .info-value { font-weight: 600; }
          .constante-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; text-align: center; }
          .constante-label { font-size: 9px; color: #64748b; }
          .constante-value { font-size: 13px; font-weight: bold; color: #1e3a5f; }
          .dossier-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 6px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 600; }
          .badge-standard { background: #dcfce7; color: #166534; }
          .badge-confidentiel { background: #fee2e2; color: #991b1b; }
          .badge-urgence { background: #fff7ed; color: #9a3412; }
          .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="structure">
            <h1>${structure?.nom || 'MediFlow'}</h1>
            <p>${structure?.type || ''}</p>
            <p>${structure?.adresse || ''}</p>
            <p>Tél: ${structure?.telephone || ''}</p>
          </div>
          <div class="titre-fiche">
            <h2>FICHE PATIENT</h2>
            <p>Imprimée le ${new Date().toLocaleDateString('fr-FR')}</p>
            <p>à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Identité</div>
          <div class="grid-2">
            <div>
              <div class="info-item"><span class="info-label">Nom complet</span><span class="info-value">${patient?.prenom} ${patient?.nom}</span></div>
              <div class="info-item"><span class="info-label">Date de naissance</span><span class="info-value">${patient?.date_naissance || '—'}</span></div>
              <div class="info-item"><span class="info-label">Âge</span><span class="info-value">${calculerAge(patient?.date_naissance) !== null ? `${calculerAge(patient?.date_naissance)} ans` : '—'}</span></div>
              <div class="info-item"><span class="info-label">Sexe</span><span class="info-value">${patient?.sexe || '—'}</span></div>
            </div>
            <div>
              <div class="info-item"><span class="info-label">N° CNI</span><span class="info-value">${patient?.numero_cni || '—'}</span></div>
              <div class="info-item"><span class="info-label">Groupe sanguin</span><span class="info-value">${patient?.groupe_sanguin || '—'}</span></div>
              <div class="info-item"><span class="info-label">Téléphone</span><span class="info-value">${patient?.telephone || '—'}</span></div>
              <div class="info-item"><span class="info-label">Adresse</span><span class="info-value">${patient?.adresse || '—'}</span></div>
            </div>
          </div>
        </div>

        ${patient?.contact_urgence ? `
        <div class="section">
          <div class="section-title">🚨 Contact d'urgence</div>
          <div class="info-item"><span class="info-label">Contact</span><span class="info-value">${patient.contact_urgence}</span></div>
          ${patient.adresse_urgence ? `<div class="info-item"><span class="info-label">Relation / Adresse</span><span class="info-value">${patient.adresse_urgence}</span></div>` : ''}
        </div>
        ` : ''}

        ${dernieresConstantes ? `
        <div class="section">
          <div class="section-title">💉 Dernières constantes vitales — ${new Date(dernieresConstantes.created_at).toLocaleDateString('fr-FR')}</div>
          <div class="grid-4">
            ${dernieresConstantes.poids ? `<div class="constante-box"><div class="constante-label">Poids</div><div class="constante-value">${dernieresConstantes.poids} kg</div></div>` : ''}
            ${dernieresConstantes.taille ? `<div class="constante-box"><div class="constante-label">Taille</div><div class="constante-value">${dernieresConstantes.taille} cm</div></div>` : ''}
            ${dernieresConstantes.temperature ? `<div class="constante-box"><div class="constante-label">Température</div><div class="constante-value">${dernieresConstantes.temperature}°C</div></div>` : ''}
            ${dernieresConstantes.tension_systolique ? `<div class="constante-box"><div class="constante-label">Tension</div><div class="constante-value">${dernieresConstantes.tension_systolique}/${dernieresConstantes.tension_diastolique}</div></div>` : ''}
            ${dernieresConstantes.pouls ? `<div class="constante-box"><div class="constante-label">Pouls</div><div class="constante-value">${dernieresConstantes.pouls} bpm</div></div>` : ''}
            ${dernieresConstantes.saturation ? `<div class="constante-box"><div class="constante-label">SpO2</div><div class="constante-value">${dernieresConstantes.saturation}%</div></div>` : ''}
            ${dernieresConstantes.glycemie ? `<div class="constante-box"><div class="constante-label">Glycémie</div><div class="constante-value">${dernieresConstantes.glycemie} g/L</div></div>` : ''}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">📋 Dossiers médicaux (${dossiers.length})</div>
          ${dossiers.length === 0 ? '<p style="color:#94a3b8;font-size:10px">Aucun dossier médical.</p>' :
            dossiers.map(d => `
              <div class="dossier-box">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-weight:600">${new Date(d.date_consultation).toLocaleDateString('fr-FR')}</span>
                  <span style="color:#64748b;font-size:10px">Dr. ${d.medecins?.prenom || ''} ${d.medecins?.nom || ''}</span>
                  <span class="badge ${d.niveau_confidentialite === 2 ? 'badge-confidentiel' : 'badge-standard'}">${d.niveau_confidentialite === 2 ? 'Confidentiel' : 'Standard'}</span>
                </div>
                ${d.niveau_confidentialite === 2 ?
                  '<p style="color:#ef4444;font-style:italic;font-size:10px">Contenu confidentiel — accès restreint</p>' :
                  `<p><strong>Diagnostic :</strong> ${d.diagnostic || '—'}</p>
                   ${d.traitement ? `<p><strong>Traitement :</strong> ${d.traitement}</p>` : ''}
                   ${d.ordonnance ? `<p><strong>Ordonnance :</strong> ${d.ordonnance}</p>` : ''}`
                }
              </div>
            `).join('')
          }
        </div>

        <div class="section">
          <div class="section-title">📅 Rendez-vous (${rdvs.length})</div>
          ${rdvs.length === 0 ? '<p style="color:#94a3b8;font-size:10px">Aucun rendez-vous.</p>' :
            `<table style="width:100%;border-collapse:collapse;font-size:10px">
              <thead><tr style="background:#f1f5f9">
                <th style="text-align:left;padding:4px 6px">Date</th>
                <th style="text-align:left;padding:4px 6px">Médecin</th>
                <th style="text-align:left;padding:4px 6px">Motif</th>
                <th style="text-align:left;padding:4px 6px">Statut</th>
              </tr></thead>
              <tbody>
                ${rdvs.map(r => `
                  <tr style="border-bottom:1px solid #e2e8f0">
                    <td style="padding:4px 6px">${new Date(r.date_heure).toLocaleDateString('fr-FR')} ${new Date(r.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style="padding:4px 6px">Dr. ${r.medecins?.prenom || ''} ${r.medecins?.nom || ''}</td>
                    <td style="padding:4px 6px">${r.motif || '—'}</td>
                    <td style="padding:4px 6px">${r.statut}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }
        </div>

        <div class="footer">
          <p>Document confidentiel — ${structure?.nom || 'MediFlow'} — Généré par MediFlow</p>
          <p>Ce document contient des informations médicales confidentielles</p>
        </div>
      </body>
      </html>
    `
    const fenetre = window.open('', '_blank')
    if (fenetre) {
      fenetre.document.write(contenu)
      fenetre.document.close()
      fenetre.print()
    }
  }

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6"><p className="text-slate-400">Chargement...</p></main>
    </div>
  )

  const age = calculerAge(patient?.date_naissance)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a href="/dashboard/patients" className="text-slate-400 hover:text-slate-600 text-sm">Patients</a>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 text-sm font-medium">{patient?.prenom} {patient?.nom}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={imprimerFiche}
              className="border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              🖨️ Imprimer la fiche
            </button>
            <a href={`/dashboard/patients/${id}/modifier`}
              className="bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              ✏️ Modifier
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-800">{patient?.prenom?.[0]}{patient?.nom?.[0]}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{patient?.prenom} {patient?.nom}</h1>
              <p className="text-slate-500 text-sm mt-1">{patient?.telephone}</p>
              <p className="text-slate-500 text-sm">{patient?.email}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Âge</span>
                  <span className="text-slate-800 font-medium">{age !== null ? `${age} ans` : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date de naissance</span>
                  <span className="text-slate-800">{patient?.date_naissance || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sexe</span>
                  <span className="text-slate-800 capitalize">{patient?.sexe || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Groupe sanguin</span>
                  <span className="text-slate-800 font-medium">{patient?.groupe_sanguin || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">N° CNI</span>
                  <span className="text-slate-800">{patient?.numero_cni || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Confidentialité</span>
                  {patient?.niveau_confidentialite === 1 ? (
                    <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Standard</span>
                  ) : (
                    <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Confidentiel</span>
                  )}
                </div>
              </div>
            </div>

            {patient?.contact_urgence && (
              <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">🚨 Contact d'urgence</p>
                <p className="text-sm font-medium text-slate-800">{patient.contact_urgence}</p>
                {patient.adresse_urgence && <p className="text-xs text-slate-500 mt-1">{patient.adresse_urgence}</p>}
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💉</span>
                  <h2 className="font-semibold text-slate-800">Constantes vitales</h2>
                </div>
                <button onClick={() => setAfficherConstantes(!afficherConstantes)}
                  className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                  + Nouvelles constantes
                </button>
              </div>

              {afficherConstantes && (
                <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3">Saisie infirmier</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Poids (kg)</label><input name="poids" value={formConstantes.poids} onChange={handleConstantesChange} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="70" /></div>
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Taille (cm)</label><input name="taille" value={formConstantes.taille} onChange={handleConstantesChange} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="170" /></div>
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Température (°C)</label><input name="temperature" value={formConstantes.temperature} onChange={handleConstantesChange} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="37.5" /></div>
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Tension (sys)</label><input name="tension_systolique" value={formConstantes.tension_systolique} onChange={handleConstantesChange} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="120" /></div>
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Tension (dia)</label><input name="tension_diastolique" value={formConstantes.tension_diastolique} onChange={handleConstantesChange} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="80" /></div>
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Pouls (bpm)</label><input name="pouls" value={formConstantes.pouls} onChange={handleConstantesChange} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="72" /></div>
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Saturation (%)</label><input name="saturation" value={formConstantes.saturation} onChange={handleConstantesChange} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="98" /></div>
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Glycémie (g/L)</label><input name="glycemie" value={formConstantes.glycemie} onChange={handleConstantesChange} type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="0.9" /></div>
                    <div><label className="text-xs font-medium text-slate-600 mb-1 block">Observations</label><input name="observations" value={formConstantes.observations} onChange={handleConstantesChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="Notes..." /></div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button onClick={sauvegarderConstantes} disabled={savingConstantes} className="bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium">{savingConstantes ? 'Enregistrement...' : 'Enregistrer'}</button>
                    <button onClick={() => setAfficherConstantes(false)} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-medium">Annuler</button>
                  </div>
                </div>
              )}

              {constantes.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune constante enregistrée.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {constantes.slice(0, 3).map((c) => (
                    <div key={c.id} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-2">{new Date(c.created_at).toLocaleDateString('fr-FR')} à {new Date(c.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {c.poids && <div className="text-center"><p className="text-xs text-slate-500">Poids</p><p className="text-sm font-semibold text-slate-800">{c.poids} kg</p></div>}
                        {c.taille && <div className="text-center"><p className="text-xs text-slate-500">Taille</p><p className="text-sm font-semibold text-slate-800">{c.taille} cm</p></div>}
                        {c.temperature && <div className="text-center"><p className="text-xs text-slate-500">Temp.</p><p className="text-sm font-semibold text-slate-800">{c.temperature}°C</p></div>}
                        {c.tension_systolique && <div className="text-center"><p className="text-xs text-slate-500">Tension</p><p className="text-sm font-semibold text-slate-800">{c.tension_systolique}/{c.tension_diastolique}</p></div>}
                        {c.pouls && <div className="text-center"><p className="text-xs text-slate-500">Pouls</p><p className="text-sm font-semibold text-slate-800">{c.pouls} bpm</p></div>}
                        {c.saturation && <div className="text-center"><p className="text-xs text-slate-500">SpO2</p><p className="text-sm font-semibold text-slate-800">{c.saturation}%</p></div>}
                        {c.glycemie && <div className="text-center"><p className="text-xs text-slate-500">Glycémie</p><p className="text-sm font-semibold text-slate-800">{c.glycemie} g/L</p></div>}
                      </div>
                      {c.observations && <p className="text-xs text-slate-500 mt-2 italic">{c.observations}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <h2 className="font-semibold text-slate-800">Dossiers médicaux</h2>
                </div>
                <a href="/dashboard/dossiers/nouveau" className="text-blue-800 text-sm">+ Nouveau</a>
              </div>
              {dossiers.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun dossier médical.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dossiers.map((d) => (
                    <div key={d.id} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-800">{new Date(d.date_consultation).toLocaleDateString('fr-FR')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Dr. {d.medecins?.prenom} {d.medecins?.nom}</span>
                          {d.niveau_confidentialite === 2 ? (
                            <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">Confidentiel</span>
                          ) : (
                            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">Standard</span>
                          )}
                        </div>
                      </div>
                      {d.niveau_confidentialite === 2 ? (
                        <p className="text-red-400 text-sm italic">Dossier confidentiel — accès restreint</p>
                      ) : (
                        <>
                          <p className="text-sm text-slate-700"><span className="font-medium">Diagnostic :</span> {d.diagnostic}</p>
                          {d.traitement && <p className="text-sm text-slate-500 mt-1"><span className="font-medium">Traitement :</span> {d.traitement}</p>}
                          {d.ordonnance && <p className="text-sm text-slate-500 mt-1"><span className="font-medium">Ordonnance :</span> {d.ordonnance}</p>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <h2 className="font-semibold text-slate-800">Rendez-vous</h2>
                </div>
                <a href="/dashboard/rendez-vous/nouveau" className="text-blue-800 text-sm">+ Nouveau</a>
              </div>
              {rdvs.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun rendez-vous.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {rdvs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(r.date_heure).toLocaleDateString('fr-FR')} à {new Date(r.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-slate-500">{r.motif}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{r.statut}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}