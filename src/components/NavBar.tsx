'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { LogIn, LogOut, Plus, Shield } from 'lucide-react'
import AuthModal from './AuthModal'

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Check if admin
        supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.is_admin || false)
          })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.is_admin || false)
          })
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]/95 backdrop-blur-lg border-b border-[var(--color-border)]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="font-display font-bold text-2xl hover:text-[var(--color-accent)] transition-colors"
            >
              Argoth
            </Link>

            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8" />
              ) : user ? (
                <>
                  <Link href="/debates/create" className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    <span className="hidden sm:inline">New Debate</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/reports"
                      className="btn-ghost flex items-center gap-2"
                      title="Admin Reports"
                    >
                      <Shield size={18} />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="btn-ghost flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}
