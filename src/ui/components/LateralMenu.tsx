import type { Role } from '#domain/models.ts';
import MenuItem from './MenuItem'

type LateralMenuProps = {
  role: Role
}

const itemsByRole: Record<Role, Array<{ label: string; path: string }>> = {
  colaborador: [
    { label: 'DashBoard', path: '/' },
    { label: 'Asistente', path: '/assistant' },
    { label: 'Mis Peticiones', path: '/peticiones' },
    { label: 'Calendario', path: '/calendario' }
  ],
  nivel2: [
    { label: 'DashBoard', path: '/' },
    { label: 'Revisión', path: '/revision' },
    { label: 'Reportes', path: '/reportes' }
  ],
  nivel1: [
    { label: 'DashBoard', path: '/' },
    { label: 'Asistente', path: '/assistant' },
  ],
  gestionHumana: [
    { label: 'DashBoard', path: '/' },
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
