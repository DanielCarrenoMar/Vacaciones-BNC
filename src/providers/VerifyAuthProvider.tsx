import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import supabase from '../data/supabase'

type VerifyAuthContextType = {
  loading: boolean
  session: any | null
}

const VerifyAuthContext = createContext<VerifyAuthContextType>({ loading: true, session: null })

export const useVerifyAuth = () => useContext(VerifyAuthContext)

// MODO DESARROLLO: Cambiar a true para simular autenticación sin Supabase
const DEV_MODE = true

// Provider that ensures the user is authenticated. If not, redirects to /auth/login
export const VerifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    // helper to avoid redirect loop for /auth routes
    const isAuthRoute = (path: string) => path.startsWith('/auth')

    // MODO DESARROLLO: Simular sesión autenticada
    if (DEV_MODE) {
      const mockSession = {
        user: {
          id: 'mock-user-id',
          email: 'pedrito.24@correo.com',
          user_metadata: {
            name: 'Pedrito'
          }
        }
      }
      setSession(mockSession)
      setLoading(false)
      return
    }

    // get initial session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!mounted) return
        setSession(data.session ?? null)
        setLoading(false)

        if (!data.session && !isAuthRoute(location.pathname)) {
          navigate('/auth/login', { replace: true })
        }
      } catch (err) {
        // on error, assume unauthenticated
        if (!mounted) return
        setSession(null)
        setLoading(false)
        if (!isAuthRoute(location.pathname)) {
          navigate('/auth/login', { replace: true })
        }
      }
    }

    getSession()

    // subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session ?? null)
      setLoading(false)
      if (!session && !isAuthRoute(location.pathname)) {
        navigate('/auth/login', { replace: true })
      }
    })

    return () => {
      mounted = false
      // unsubscribe if available (defensive for different supabase client shapes)
      try {
        // supabase v2 returns { data: { subscription } }
        // some typings may differ; attempt to call unsubscribe if present
        // @ts-ignore - defensive runtime check
        const maybeSub = subscription?.subscription ?? subscription
        if (maybeSub && typeof maybeSub.unsubscribe === 'function') {
          maybeSub.unsubscribe()
        }
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <VerifyAuthContext.Provider value={{ loading, session }}>
      {children}
    </VerifyAuthContext.Provider>
  )
}

export default VerifyAuthProvider
