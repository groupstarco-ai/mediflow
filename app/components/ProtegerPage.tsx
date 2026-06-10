'use client'

import { useEffect, useState } from 'react'
import { peutAcceder } from '@/lib/permissions'
import type { Module } from '@/lib/permissions'

export default function ProtegerPage({
  module,
  action = 'peut_voir',
  children,
}: {
  module: Module
  action?: 'peut_voir' | 'peut_creer' | 'peut_modifier' | 'peut_supprimer'
  children: React.ReactNode
}) {
  const [autorise, setAutorise] = useState<boolean | null>(null)

  useEffect(() => {
    const verifier = async () => {
      const ok = await peutAcceder(module, action)
      setAutorise(ok)
      if (!ok) {
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    }
    verifier()
  }, [module, action])

  if (autorise === null) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <p className="text-slate-400 text-sm">Vérification des autorisations...</p>
    </div>
  )

  if (!autorise) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 max-w-md text-center">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Accès refusé</h1>
        <p className="text-slate-500 text-sm mb-4">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
        <p className="text-xs text-slate-400">Redirection vers le tableau de bord...</p>
      </div>
    </div>
  )

  return <>{children}</>
}