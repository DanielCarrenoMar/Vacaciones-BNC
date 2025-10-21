import { useVerifyAuth } from "#providers/VerifyAuthProvider.tsx"

export default function DashBoard() {
    const { user, userRole } = useVerifyAuth()

    return (
        <div>
            DashBoard Colaborador {user?.email} - Rol: {userRole}
        </div>
    )
}
