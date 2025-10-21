import { useVerifyAuth } from "#providers/VerifyAuthProvider.tsx"

export default function DashBoard() {
    const { userRole, user } = useVerifyAuth()

    return (
        <div>
            DashBoard Colaborador {user?.email} - Rol: {userRole}
        </div>
    )
}
