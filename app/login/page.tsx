'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('Invalid email or password')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      // Get redirectTo from query params or default to dashboard
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CoreHub Focus</h1>
          <h2 className="text-xl font-semibold text-white mb-2">Sign in to your workspace</h2>
          <p className="text-sm text-[#888888]">Access your internal mobile app command center.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white placeholder:text-[#888888] focus:outline-none focus:border-[#0070F3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white placeholder:text-[#888888] focus:outline-none focus:border-[#0070F3]"
            />
          </div>
          {error && (
            <div className="text-sm text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg p-3">
              {error}
            </div>
          )}
          <Button className="w-full bg-white text-black hover:bg-gray-100" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">CoreHub Focus</h1>
            <p className="text-sm text-[#888888]">Loading...</p>
          </div>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
