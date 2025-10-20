import MenuItem from './MenuItem'

export type Role = 'colaborador' | 'nivel2' | 'nivel1' | 'gestionHumana'

type LateralMenuProps = {
  role: Role
}

const itemsByRole: Record<Role, Array<{ label: string; path: string }>> = {
  colaborador: [
    { label: 'DashBoard', path: '/dashboard' },
    { label: 'Asistente', path: '/asistente' },
    { label: 'Mis Peticiones', path: '/peticiones' },
    { label: 'Calendario', path: '/calendario' }
  ],
  nivel2: [
    { label: 'DashBoard', path: '/dashboard' },
    { label: 'Revisión', path: '/revision' },
    { label: 'Reportes', path: '/reportes' }
  ],
  nivel1: [
    { label: 'DashBoard', path: '/dashboard' },
    { label: 'Aprobaciones', path: '/aprobaciones' },
    { label: 'Gestión', path: '/gestion' }
  ],
  gestionHumana: [
    { label: 'DashBoard', path: '/dashboard' },
    { label: 'Configuración', path: '/config' },
    { label: 'Usuarios', path: '/usuarios' }
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
      </nav>
    </aside>
  )
}
