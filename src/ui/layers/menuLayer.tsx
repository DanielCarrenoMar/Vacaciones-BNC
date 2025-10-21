import LateralMenu from '../components/LateralMenu'
import { Outlet } from 'react-router-dom'
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx'

export default function MenuLayer() {
    const { user, userRole } = useVerifyAuth()

    return (
    <div className="h-screen flex bg-[#F5F5F7] overflow-hidden">
        <LateralMenu role={userRole} />
        <main className="flex-1 p-6 flex-col flex overflow-y-auto">
            <header>
                <h1 className="text-2xl font-bold mb-4">Bienvenido, {user?.name}</h1>
            </header>
            <Outlet />
        </main>
    </div>
    )
}
