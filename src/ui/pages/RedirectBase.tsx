import { useVerifyAuth } from "#providers/VerifyAuthProvider.tsx"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function RedirectBase(){
    const { userRole } = useVerifyAuth()
    const navigate = useNavigate ()
    useEffect(() => {
        if (!userRole) return
        if (userRole === 'nivel2') navigate('/nivel2/dashboard', { replace: true })
        else if (userRole === 'nivel1') navigate('/nivel2/dashboard', { replace: true })
        else if (userRole === 'gestionHumana') navigate('/nivel2/dashboard', { replace: true })
        else navigate('/dashboard', { replace: true })
    }, [userRole])
    return <></>
}