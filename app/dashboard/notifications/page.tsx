'use client'

import Sidebar from '../../components/Sidebar'

export default function Notifications() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Notifications</h1>
        <p className="text-slate-500 text-sm">Module en cours de développement.</p>
      </main>
    </div>
  )
}