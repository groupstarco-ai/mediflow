import { NextRequest, NextResponse } from 'next/server'
import { createStructure } from '@/lib/admin/createStructure'

export async function POST(request: NextRequest) {

  const authHeader = request.headers.get('authorization')
  const superAdminKey = process.env.SUPER_ADMIN_SECRET_KEY

  if (!authHeader || authHeader !== `Bearer ${superAdminKey}`) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    const result = await createStructure({
      nom: body.nom,
      email: body.email,
      telephone: body.telephone,
      adresse: body.adresse,
      plan: body.plan ?? 'clinique',
      adminEmail: body.adminEmail,
      adminPassword: body.adminPassword,
      adminNom: body.adminNom,
      adminPrenom: body.adminPrenom,
    })

    return NextResponse.json(result, { status: 201 })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}