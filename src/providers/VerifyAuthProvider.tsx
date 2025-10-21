import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import supabase from '../data/supabase'
import type { Role, User } from '#domain/models.ts'
import { userRepo } from '#repository/databaseRepositoryImpl.tsx'
import type { Session } from '@supabase/supabase-js'
import LoadingPage from '#ui/components/LoadingPage.tsx'
import pino from 'pino'

type VerifyAuthContextType = {
  loading: boolean
  session: any | null
  user: User | null
  userRole: Role
}

const VerifyAuthContext = createContext<VerifyAuthContextType>({ loading: true, session: null, user: null, userRole: "colaborador" })

export const useVerifyAuth = () => useContext(VerifyAuthContext)
const logger = pino()

// Provider that ensures the user is authenticated. If not, redirects to /auth/login
export const VerifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<Role>("colaborador")
  const navigate = useNavigate()
  const location = useLocation()

  // helpers fuera del useEffect
  const isAuthRoute = (path: string) => path.startsWith('/auth')
  const isNivel2Route = (path: string) => path.startsWith('/nivel2')
  const isNivel1Route = (path: string) => path.startsWith('/nivel1')
  const isgestionRoute = (path: string) => path.startsWith('/gestion')

  function redirectProtedRoute(path: string, role: Role) {
    if (isgestionRoute(path) && role !== 'gestionHumana') navigate('/', { replace: true })
    else if (isNivel1Route(path) && role !== 'nivel1') navigate('/', { replace: true })
    else if (isNivel2Route(path) && role !== 'nivel2') navigate('/', { replace: true })
  }

  useEffect(() => {
    let mounted = true

    async function fetchUserData(session: Session | null) {
      if (session) {
        if (!session?.user?.email) return
        const { data: userData, error: userError } = await userRepo.getByEmail(session.user.email)
        if (userError) throw userError

        if (!userData) return
        setUser(userData)

        const { data: levelData, error: levelError } = await userRepo.getLevelsBelow(userData.employedID)
        if (levelError) throw levelError
        if (!levelData) return
        setUserRole((() => {
          if (user?.area === "Gestión Humana") return 'gestionHumana'
          else if (levelData.levelsBelow === 2) return 'nivel1'
          else if (levelData.levelsBelow === 1) return 'nivel2'
          else return 'colaborador'
        }))
      }
    }

    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!mounted) return
        setSession(data.session ?? null)
        await fetchUserData(data.session)
        setLoading(false)
      } catch (err) {
        logger.error('Error getting session')
        if (!mounted) return
        setSession(null)
        setLoading(false)
      }
    }

    getSession()

    // subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session ?? null)
    })

    return () => {
      mounted = false
      try {
        const maybeSub = subscription?.subscription ?? subscription
        if (maybeSub && typeof maybeSub.unsubscribe === 'function') {
          maybeSub.unsubscribe()
        }
      } catch (e) {
        logger.error('Error unsubscribing from auth listener')
      }
    }
  }, [])

  useEffect(() => {
    if (!session && !isAuthRoute(location.pathname)) {
      navigate('/auth/login', { replace: true })
    }
    if (!loading && user && userRole) {
      redirectProtedRoute(location.pathname, userRole)
    }
  }, [loading, user, userRole, location.pathname])

  return (
    <VerifyAuthContext.Provider value={{ loading, session, user, userRole }}>
      {loading ? <LoadingPage /> : children}
    </VerifyAuthContext.Provider>
  )
}

export default VerifyAuthProvider
