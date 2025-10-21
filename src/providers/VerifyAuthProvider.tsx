import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import supabase from '../data/supabase'
import type { User } from '#domain/models.ts'
import { userRepo } from '#repository/databaseRepositoryImpl.tsx'
import type { Session } from '@supabase/supabase-js'

type VerifyAuthContextType = {
  loading: boolean
  session: any | null
  user: User | null
  levelUser: number | null
}

const VerifyAuthContext = createContext<VerifyAuthContextType>({ loading: true, session: null, user: null, levelUser: null })

export const useVerifyAuth = () => useContext(VerifyAuthContext)

// Provider that ensures the user is authenticated. If not, redirects to /auth/login
export const VerifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [levelUser, setLevelUser] = useState<number | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    async function fetchUserData(session: Session | null){
      if (session) {
          if (!session?.user?.email) return
          const { data: userData, error: userError } = await userRepo.getByEmail(session.user.email)
          if (userError) throw userError

          if (!userData) return
          setUser(userData)

          const { data: levelData, error: levelError } = await userRepo.getLevelsBelow(userData.employedID)
          if (levelError) throw levelError
          setLevelUser(levelData?.levelsBelow ?? null)
        }
    }

    // helper to avoid redirect loop for /auth routes
    const isAuthRoute = (path: string) => path.startsWith('/auth')

    // get initial session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!mounted) return
        setSession(data.session ?? null)
        await fetchUserData(data.session)
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
      console.log('Auth state changed:', _event, session)
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
    <VerifyAuthContext.Provider value={{ loading, session, user, levelUser }}>
      {children}
    </VerifyAuthContext.Provider>
  )
}

export default VerifyAuthProvider
