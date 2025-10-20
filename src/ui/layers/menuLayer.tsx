import { useEffect, useState } from 'react'
import LateralMenu from '../components/LateralMenu'
import type { User } from '#domain/models.ts'
import { userRepo } from '#repository/databaseRepositoryImpl.tsx'
import supabase from '../../data/supabase'
import { Outlet } from 'react-router-dom'

// MODO DESARROLLO: Cambiar a true para usar datos mock
const DEV_MODE = true

export default function MenuLayer() {
    const [user, setUser] = useState<User>();
    const [userLevel, setUserLevel] = useState<number>();
    
    useEffect(() => {
        // MODO DESARROLLO: Usar datos mock
        if (DEV_MODE) {
            const mockUser: User = {
                employedID: 123,
                name: 'Pedrito',
                email: 'pedrito.24@correo.com',
                area: 'Desarrollo',
                position: 'Programador Frontend',
                entryDate: '2024-01-01',
                reportTo: null
            }
            
            setUser(mockUser)
            setUserLevel(2) // nivel1 role
            return
        }

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
    <div className="h-screen flex bg-[#F5F5F7] overflow-hidden">
        <LateralMenu role={
            (() => {
                if (userLevel === 2 && user?.area === "Gestión Humana") return "gestionHumana"
                else if (userLevel === 2) return "nivel1"
                else if (userLevel === 1) return "nivel2"
                else return "colaborador"
            })()
        } />
        <main className="flex-1 overflow-y-auto">
            <Outlet />
        </main>
    </div>
    )
}
