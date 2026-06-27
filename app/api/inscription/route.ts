import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { structure, admin } = body

    // 1. Créer la structure
    const { data: nouvelleStructure, error: erreurStructure } = await supabaseAdmin
      .from('structures')
      .insert([{
        nom: structure.nom,
        type: structure.type,
        adresse: structure.adresse,
        telephone: structure.telephone,
        email: structure.email,
        plan_saas: 'starter',
        actif: true,
      }])
      .select()
      .single()

    if (erreurStructure) {
      return NextResponse.json({ error: 'Erreur structure: ' + erreurStructure.message }, { status: 400 })
    }

    // 2. Créer le compte auth
    const { data: authData, error: erreurAuth } = await supabaseAdmin.auth.admin.createUser({
      email: admin.email,
      password: admin.mot_de_passe,
      email_confirm: true,
    })

    if (erreurAuth) {
      // Rollback : supprimer la structure créée si l'auth échoue
      await supabaseAdmin.from('structures').delete().eq('id', nouvelleStructure.id)
      return NextResponse.json({ error: 'Erreur auth: ' + erreurAuth.message }, { status: 400 })
    }

    // 3. Créer l'utilisateur dans la table utilisateurs
    const { error: erreurUtilisateur } = await supabaseAdmin
      .from('utilisateurs')
      .insert([{
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
        role: 'administrateur',
        structure_id: nouvelleStructure.id,
        actif: true,
        auth_id: authData.user.id,
      }])

    if (erreurUtilisateur) {
      return NextResponse.json({ error: 'Erreur utilisateur: ' + erreurUtilisateur.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, structureId: nouvelleStructure.id })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}