import LateralMenu from '../components/LateralMenu'
import { Outlet } from 'react-router-dom'
<<<<<<< HEAD
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx'

export default function MenuLayer() {
    const { user, userRole, loading } = useVerifyAuth()

    if (loading) {
=======

export default function MenuLayer() {
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
>>>>>>> 0775f5f (añadir cierre de sesion y mejorar(no funcional))
        return <div>Loading...</div>
    }
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
