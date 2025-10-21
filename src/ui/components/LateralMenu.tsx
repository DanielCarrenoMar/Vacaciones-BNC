import type { Role } from '#domain/models.ts';
import supabase from '../../data/supabase';
import MenuItem from './MenuItem'

type LateralMenuProps = {
    role: Role
}

const itemsByRole: Record<Role, Array<{ label: string; path: string }>> = {
    gestionHumana: [
        { label: 'DashBoard', path: '/' },
        { label: 'Asistente', path: '/assistant' },
        { label: 'Mis Peticiones', path: '/my-requests' },
        { label: 'Calendario', path: '/calendar' },
        { label: 'Revisar Peticiones', path: '/nivel1/review' },
        { label: 'Configuración', path: '/config' },
    ],
    nivel1: [
        { label: 'DashBoard', path: '/' },
        { label: 'Asistente', path: '/assistant' },
        { label: 'Mis Peticiones', path: '/my-requests' },
        { label: 'Calendario', path: '/calendar' },
        { label: 'Revisar Peticiones', path: '/nivel1/review' },
        { label: 'Configuración', path: '/config' },
    ],
    nivel2: [
        { label: 'DashBoard', path: '/' },
        { label: 'Asistente', path: '/assistant' },
        { label: 'Mis Peticiones', path: '/my-requests' },
        { label: 'Calendario', path: '/calendar' },
        { label: 'Revisar Peticiones', path: '/nivel2/review' },
        { label: 'Configuración', path: '/config' },
    ],
    colaborador: [
        { label: 'DashBoard', path: '/' },
        { label: 'Asistente', path: '/assistant' },
        { label: 'Mis Peticiones', path: '/my-requests' },
        { label: 'Calendario', path: '/calendar' },
        { label: 'Configuración', path: '/config' },
    ]
}

export default function LateralMenu({ role }: LateralMenuProps) {
    const items = itemsByRole[role]

    return (
        <aside className="w-64 bg-white border-r p-3 h-full">
            <div className="mb-4 p-2">
                <div className="text-lg font-bold">Bienestar BNC</div>
            </div>
            <nav className="flex flex-col gap-1">
                {items.map((it) => (
                    <MenuItem key={it.path} label={it.label} href={it.path} />
                ))}
                <MenuItem label="Cerrar sesión" href="/auth/logout" onClick={() => supabase.auth.signOut()} />
            </nav>
        </aside>
    )
}
