import LateralMenu from '../components/LateralMenu'
import { Outlet } from 'react-router-dom'
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx'

export default function MenuLayer() {
    const { user, levelUser, loading } = useVerifyAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    return (
    <div className="min-h-screen flex bg-gray-50">
        <LateralMenu role={
            (() => {
                if (levelUser === 2 && user?.area === "Gestión Humana") return "gestionHumana"
                else if (levelUser === 2) return "nivel1"
                else if (levelUser === 1) return "nivel2"
                else return "colaborador"
            })()
        } />
        <main className="flex-1 p-6">
            <Outlet />
        </main>
    </div>
    )
}
