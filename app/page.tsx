export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-800 rounded-lg"></div>
          <span className="font-semibold text-slate-800 text-lg">MediFlow</span>
        </div>
        <a href="/login" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Se connecter
        </a>
      </header>

      <section className="flex flex-col items-center justify-center text-center px-8 py-32">
        <span className="text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full mb-6">
          Gestion médicale simplifiée
        </span>
        <h1 className="text-5xl font-bold text-slate-900 max-w-2xl leading-tight">
          Gérez vos rendez-vous et patients en toute simplicité
        </h1>
        <p className="text-slate-500 mt-6 max-w-xl text-lg">
          MediFlow centralise la gestion de vos patients, rendez-vous et dossiers médicaux pour les cliniques et cabinets médicaux.
        </p>
        <div className="flex gap-4 mt-10">
          <a href="/login" className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium">
            Démarrer gratuitement
          </a>
          <a href="/login" className="border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium">
            Voir la démo
          </a>
        </div>
      </section>

      <section className="bg-slate-50 px-8 py-24">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">
          Tout ce dont votre structure a besoin
        </h2>
        <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-800 text-xl">📅</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Rendez-vous</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Planifiez, confirmez et gérez tous vos rendez-vous depuis un seul endroit. Rappels automatiques par SMS.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-800 text-xl">👤</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Dossiers patients</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Historique médical complet, ordonnances et résultats d'analyses accessibles en un clic.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-800 text-xl">📊</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Statistiques</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Suivez l'activité de votre structure, le taux d'occupation et les revenus en temps réel.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-blue-800 px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Prêt à moderniser votre structure ?
        </h2>
        <p className="text-blue-200 mb-8 max-w-lg mx-auto">
          Rejoignez les cliniques et cabinets qui font confiance à MediFlow pour gérer leurs patients.
        </p>
        <a href="/login" className="bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold">
          Commencer gratuitement
        </a>
      </section>

      <footer className="px-8 py-6 border-t border-slate-100 flex items-center justify-between">
        <span className="font-semibold text-slate-800">MediFlow</span>
        <span className="text-slate-400 text-sm">© 2026 MediFlow. Tous droits réservés.</span>
      </footer>

    </main>
  )
}