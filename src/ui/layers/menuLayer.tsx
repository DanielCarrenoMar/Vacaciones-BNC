import { useEffect, useState, type ReactNode } from 'react'
import LateralMenu from '../components/LateralMenu'
import type { Role, User } from '#domain/models.ts'
import { userRepo } from '#repository/databaseRepositoryImpl.tsx'
import supabase from '../../data/supabase'

type MenuLayerProps = {
  role?: Role
  children: ReactNode
}

export default function MenuLayer({ children }: MenuLayerProps) {
    const [user, setUser] = useState<User>();
    const [userLevel, setUserLevel] = useState<number>();
    useEffect(() => {
        async function fetchUser(email: string) {
            const { data:user, error:userError } = await userRepo.getByEmail(email);
            if (userError) {
                console.error(userError)
                return
            }
            if (!user) return

            setUser(user)
            const { data:level, error:levelError } = await userRepo.getLevelsBelow(user?.employedID);
            if (level !== undefined) setUserLevel(level?.levelsBelow)
            if (levelError) console.error(levelError);
        } 
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.email) fetchUser(user.email);
        })
    }, []);

    if (userLevel === undefined || user === undefined) {
        return <div>Loading...</div>
    }

    return (
    <div className="min-h-screen flex bg-gray-50">
        <LateralMenu role={
            (() => {
                if (userLevel === 2 && user?.area === "Gestión Humana") return "gestionHumana"
                else if (userLevel === 2) return "nivel1"
                else if (userLevel === 1) return "nivel2"
                else return "colaborador"
            })()
        } />
        {userLevel}
        <main className="flex-1 p-6">
        {children}
        </main>
    </div>
    )
}
