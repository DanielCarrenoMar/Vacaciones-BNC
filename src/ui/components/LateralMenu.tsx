import type { Role } from '#domain/models.ts';
import MenuItem from './MenuItem'
import ConfirmModal from './ConfirmModal'
import { LayoutDashboard, RefreshCw, FileText, Users, Calendar, Settings, LogOut, ChevronLeft, ChevronRight, TrendingUp, Rocket } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type LateralMenuProps = {
    role: Role
}

type MenuItem = {
    label: string
    path: string
    icon: React.ReactNode
    section?: 'principal' | 'sistema'
}

const itemsByRole: Record<Role, Array<MenuItem>> = {
    gestionHumana: [
        { label: 'DashBoard', path: '/', icon: <LayoutDashboard size={20} />, section: 'principal' },
        { label: 'Revisar Peticiones', path: '/nivel1/review', icon: <RefreshCw size={20} />, section: 'principal' },
        { label: 'Mis Peticiones', path: '/my-requests', icon: <FileText size={20} />, section: 'principal' },
        { label: 'Estadísticas', path: '/statistics', icon: <TrendingUp size={20} />, section: 'principal' },
        { label: 'Asistente', path: '/assistant', icon: <Rocket size={20} />, section: 'principal' },
        { label: 'Equipo', path: '/team', icon: <Users size={20} />, section: 'principal' },
        { label: 'Calendario', path: '/calendar', icon: <Calendar size={20} />, section: 'principal' },
        { label: 'Configuración', path: '/config', icon: <Settings size={20} />, section: 'sistema' },
    ],
    nivel1: [
        { label: 'DashBoard', path: '/', icon: <LayoutDashboard size={20} />, section: 'principal' },
        { label: 'Revisar Peticiones', path: '/nivel1/review', icon: <RefreshCw size={20} />, section: 'principal' },
        { label: 'Mis Peticiones', path: '/my-requests', icon: <FileText size={20} />, section: 'principal' },
        { label: 'Estadísticas', path: '/statistics', icon: <TrendingUp size={20} />, section: 'principal' },
        { label: 'Asistente', path: '/assistant', icon: <Rocket size={20} />, section: 'principal' },
        { label: 'Equipo', path: '/team', icon: <Users size={20} />, section: 'principal' },
        { label: 'Calendario', path: '/calendar', icon: <Calendar size={20} />, section: 'principal' },
        { label: 'Configuración', path: '/config', icon: <Settings size={20} />, section: 'sistema' },
    ],
    nivel2: [
        { label: 'DashBoard', path: '/', icon: <LayoutDashboard size={20} />, section: 'principal' },
        { label: 'Revisar Peticiones', path: '/nivel2/review', icon: <RefreshCw size={20} />, section: 'principal' },
        { label: 'Mis Peticiones', path: '/my-requests', icon: <FileText size={20} />, section: 'principal' },
        { label: 'Estadísticas', path: '/statistics', icon: <TrendingUp size={20} />, section: 'principal' },
        { label: 'Asistente', path: '/assistant', icon: <Rocket size={20} />, section: 'principal' },
        { label: 'Equipo', path: '/team', icon: <Users size={20} />, section: 'principal' },
        { label: 'Calendario', path: '/calendar', icon: <Calendar size={20} />, section: 'principal' },
        { label: 'Configuración', path: '/config', icon: <Settings size={20} />, section: 'sistema' },
    ],
    colaborador: [
        { label: 'DashBoard', path: '/', icon: <LayoutDashboard size={20} />, section: 'principal' },
        { label: 'Mis Peticiones', path: '/my-requests', icon: <FileText size={20} />, section: 'principal' },
        { label: 'Asistente', path: '/assistant', icon: <Rocket size={20} />, section: 'principal' },
        { label: 'Calendario', path: '/calendar', icon: <Calendar size={20} />, section: 'principal' },
        { label: 'Configuración', path: '/config', icon: <Settings size={20} />, section: 'sistema' },
    ]
}

export default function LateralMenu({ role }: LateralMenuProps) {
    const items = itemsByRole[role]
    // Recuperar el estado del menú desde localStorage, por defecto colapsado
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('menuCollapsed')
        return saved !== null ? JSON.parse(saved) : true
    })
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const navigate = useNavigate()
    
    // Guardar el estado del menú en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('menuCollapsed', JSON.stringify(isCollapsed))
    }, [isCollapsed])
    
    const principalItems = items.filter(item => item.section === 'principal')
    const sistemaItems = items.filter(item => item.section === 'sistema')

    const handleLogoutClick = () => {
        setShowLogoutModal(true)
    }

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false)
        navigate('/auth/logout')
    }

    return (
        <div className="flex h-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Panel lateral colapsado con íconos */}
            <aside className="w-20 bg-white border-r border-gray-200 p-3 h-full flex flex-col items-center">
                {/* Botón de toggle */}
                <button
                    className="flex items-center justify-center p-2 w-10 h-10 mb-4 hover:bg-background rounded-lg transition-colors text-onsurface"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div className="mb-6 text-xs font-semibold text-gray-400">P</div>
                <nav className="flex flex-col gap-2 items-center flex-1">
                    {principalItems.map((item) => (
                        <MenuItem
                            key={`icon-${item.path}`}
                            label={item.label}
                            href={item.path}
                            icon={item.icon}
                            isCollapsed={true}
                        />
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2 items-center">
                    <div className="mb-2 text-xs font-semibold text-gray-400">S</div>
                    {sistemaItems.map((item) => (
                        <MenuItem
                            key={`icon-${item.path}`}
                            label={item.label}
                            href={item.path}
                            icon={item.icon}
                            isCollapsed={true}
                        />
                    ))}
                    <MenuItem
                            key={`icon-logout`}
                            label="Cerrar sesión"
                            href="#"
                            icon={<LogOut size={20} />}
                            isCollapsed={true}
                            onClick={handleLogoutClick}
                    />
                </div>
            </aside>

            {/* Panel principal expandido */}
            <aside
                className={`${isCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'} bg-background border-r border-gray-200 p-5 h-full transition-all duration-300 flex flex-col overflow-hidden`}
            >
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <span className="text-onsurface font-medium">Bienestar BNC</span>
                </div>

                {/* Principal Section */}
                <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 mb-3 px-3">PRINCIPAL</div>
                    <nav className="flex flex-col gap-1">
                        {principalItems.map((item) => (
                            <MenuItem
                                key={item.path}
                                label={item.label}
                                href={item.path}
                                icon={item.icon}
                                isCollapsed={false}
                            />
                        ))}
                    </nav>
                </div>

                {/* Sistema Section */}
                <div className="mt-auto">
                    <div className="text-xs font-semibold text-gray-500 mb-3 px-3">SISTEMA</div>
                    <nav className="flex flex-col gap-1">
                        {sistemaItems.map((item) => (
                            <MenuItem
                                key={item.path}
                                label={item.label}
                                href={item.path}
                                icon={item.icon}
                                isCollapsed={false}
                            />
                        ))}
                        <MenuItem
                            key={`icon-logout`}
                            label="Cerrar sesión"
                            href="#"
                            icon={<LogOut size={20} />}
                            isCollapsed={false}
                            onClick={handleLogoutClick}
                        />
                    </nav>
                </div>
            </aside>

            {/* Modal de confirmación de logout */}
            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutConfirm}
                title="Cerrar sesión"
                message="¿Estás seguro de que deseas cerrar sesión?"
                confirmText="Sí, cerrar sesión"
                cancelText="Cancelar"
            />
        </div>
    )
}
