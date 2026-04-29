import { AppLogo } from '@/components/ui/AppLogo'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-8 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-zinc-400 mt-1">Gérez votre compte et vos préférences</p>
        </div>

        {/* Profil */}
        <div className="bg-[#111111] border border-[#333333] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">👤 Profil</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-zinc-400">Nom complet</label>
              <input
                type="text"
                placeholder="Votre nom"
                className="w-full mt-1 px-4 py-2 bg-black border border-[#333333] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full mt-1 px-4 py-2 bg-black border border-[#333333] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>
          </div>
          <button className="mt-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition">
            Sauvegarder
          </button>
        </div>

        {/* Mot de passe */}
        <div className="bg-[#111111] border border-[#333333] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">🔒 Mot de passe</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-zinc-400">Ancien mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-2 bg-black border border-[#333333] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-2 bg-black border border-[#333333] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>
          </div>
          <button className="mt-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition">
            Modifier le mot de passe
          </button>
        </div>

        {/* Apparence */}
        <div className="bg-[#111111] border border-[#333333] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">🎨 Apparence</h2>
          <p className="text-sm text-zinc-400">Thème actuel</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-black border border-white text-white rounded-lg text-sm">
              🌑 Sombre
            </button>
            <button className="px-4 py-2 bg-black border border-[#333333] text-zinc-400 rounded-lg text-sm hover:border-white transition">
              ☀️ Clair
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-[#111111] border border-red-900 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-red-500">⚠️ Zone dangereuse</h2>
          <p className="text-sm text-zinc-400">La suppression de votre compte est irréversible.</p>
          <button className="px-4 py-2 text-red-500 border border-red-500 rounded-lg text-sm hover:bg-red-500 hover:text-white transition">
            Supprimer mon compte
          </button>
        </div>

      </div>
    </div>
  )
}