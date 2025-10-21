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
        <main className="flex-1 p-6">
            <Outlet />
        </main>
    </div>
    )
}
