import LateralMenu from '../components/LateralMenu'
import { Outlet } from 'react-router-dom'
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx'

export default function MenuLayer() {
    const { user, userRole, loading } = useVerifyAuth()

    if (loading) {
        return <div>Loading...</div>
    }
    return (
    <div className="min-h-screen flex bg-gray-50">
        <LateralMenu role={userRole} />
        <main className="flex-1 p-6 flex-col flex">
            <header>
                <h1 className="text-2xl font-bold mb-4">Bienvenido, {user?.name}</h1>
            </header>
            <Outlet />
        </main>
    </div>
    )
}
