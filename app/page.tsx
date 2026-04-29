import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AppLogo } from '@/components/ui/AppLogo'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <AppLogo size="lg" />
        </div>
        <p className="text-xl text-[#888888] max-w-md mx-auto">
          Plateforme interne de gestion d'applications mobiles
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/login">
            <Button variant="primary">Connexion</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
