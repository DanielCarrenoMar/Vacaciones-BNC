import { useState } from 'react'
import { User, Shield, Bell, Palette, HelpCircle, ChevronRight, Camera, Phone, Mail, Lock, Globe, Moon, Sun, Monitor } from 'lucide-react'
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx'

type ConfigSection = 'profile' | 'security' | 'notifications' | 'appearance' | 'help'

export default function Configuration() {
    const { user } = useVerifyAuth()
    const [activeSection, setActiveSection] = useState<ConfigSection>('profile')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [pushNotifications, setPushNotifications] = useState(true)
    const [notifyStatusChange, setNotifyStatusChange] = useState(true)
    const [notifyReminders, setNotifyReminders] = useState(true)
    const [notifyAnnouncements, setNotifyAnnouncements] = useState(false)
    const [language, setLanguage] = useState('es')
    const [theme, setTheme] = useState('light')

    const sections = [
        { id: 'profile' as ConfigSection, label: 'Perfil', icon: <User size={20} /> },
        { id: 'security' as ConfigSection, label: 'Seguridad', icon: <Shield size={20} /> },
        { id: 'notifications' as ConfigSection, label: 'Notificaciones', icon: <Bell size={20} /> },
        { id: 'appearance' as ConfigSection, label: 'Apariencia', icon: <Palette size={20} /> },
        { id: 'help' as ConfigSection, label: 'Ayuda', icon: <HelpCircle size={20} /> },
    ]

    return (
        <div className="h-full bg-[#F5F5F7] p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[#212121] mb-8">Configuración</h1>

                <div className="flex gap-6">
                    {/* Sidebar con pestañas */}
                    <aside className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
                        <nav className="flex flex-col gap-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                        activeSection === section.id
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-[#212121] hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {section.icon}
                                        <span className="font-medium">{section.label}</span>
                                    </div>
                                    <ChevronRight size={16} />
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Contenido principal */}
                    <main className="flex-1 bg-white rounded-lg shadow-sm p-8">
                        {activeSection === 'profile' && <ProfileSection user={user} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} />}
                        {activeSection === 'security' && <SecuritySection />}
                        {activeSection === 'notifications' && (
                            <NotificationsSection
                                emailNotifications={emailNotifications}
                                setEmailNotifications={setEmailNotifications}
                                pushNotifications={pushNotifications}
                                setPushNotifications={setPushNotifications}
                                notifyStatusChange={notifyStatusChange}
                                setNotifyStatusChange={setNotifyStatusChange}
                                notifyReminders={notifyReminders}
                                setNotifyReminders={setNotifyReminders}
                                notifyAnnouncements={notifyAnnouncements}
                                setNotifyAnnouncements={setNotifyAnnouncements}
                            />
                        )}
                        {activeSection === 'appearance' && (
                            <AppearanceSection
                                language={language}
                                setLanguage={setLanguage}
                                theme={theme}
                                setTheme={setTheme}
                            />
                        )}
                        {activeSection === 'help' && <HelpSection />}
                    </main>
                </div>
            </div>
        </div>
    )
}

// Sección de Perfil
function ProfileSection({ user, phoneNumber, setPhoneNumber }: { user: any; phoneNumber: string; setPhoneNumber: (v: string) => void }) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-[#212121] mb-6">Gestión de Perfil</h2>

            {/* Foto de perfil */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Foto de Perfil</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={40} className="text-gray-500" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <Camera size={18} />
                        Cambiar foto
                    </button>
                </div>
            </div>

            {/* Información Personal (Solo lectura) */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#212121] mb-4">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={user?.name || ''}
                            disabled
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cédula</label>
                        <input
                            type="text"
                            value={user?.idNumber || ''}
                            disabled
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cargo</label>
                        <input
                            type="text"
                            value={user?.position || ''}
                            disabled
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Departamento</label>
                        <input
                            type="text"
                            value={user?.department || ''}
                            disabled
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Información de Contacto (Editable) */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#212121] mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono de contacto</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+58 412 123 4567"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Información Organizacional (Solo lectura) */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#212121] mb-4">Información Organizacional</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Supervisor Directo</label>
                    <input
                        type="text"
                        value={user?.supervisorName || 'No asignado'}
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                    />
                </div>
            </div>

            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Guardar cambios
            </button>
        </div>
    )
}

// Sección de Seguridad
function SecuritySection() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-[#212121] mb-6">Seguridad de la Cuenta</h2>

            <div className="space-y-6">
                {/* Cambiar Contraseña */}
                <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Lock size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[#212121] mb-2">Cambiar Contraseña</h3>
                            <p className="text-gray-600 mb-4">
                                Actualiza tu contraseña regularmente para mantener tu cuenta segura.
                            </p>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Cambiar mi contraseña
                            </button>
                        </div>
                    </div>
                </div>

                {/* Autenticación de Dos Pasos */}
                <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Shield size={24} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[#212121] mb-2">Autenticación de Dos Pasos (2FA)</h3>
                            <p className="text-gray-600 mb-4">
                                Añade una capa extra de seguridad a tu cuenta requiriendo un código adicional al iniciar sesión.
                            </p>
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                Activar 2FA
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Sección de Notificaciones
function NotificationsSection({
    emailNotifications,
    setEmailNotifications,
    pushNotifications,
    setPushNotifications,
    notifyStatusChange,
    setNotifyStatusChange,
    notifyReminders,
    setNotifyReminders,
    notifyAnnouncements,
    setNotifyAnnouncements,
}: any) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-[#212121] mb-6">Preferencias de Notificaciones</h2>

            {/* Canales de notificación */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#212121] mb-4">Canales de Notificación</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <p className="font-medium text-[#212121]">Notificarme por Email</p>
                            <p className="text-sm text-gray-600">Recibe notificaciones en tu correo electrónico</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <p className="font-medium text-[#212121]">Notificarme por Push</p>
                            <p className="text-sm text-gray-600">Recibe notificaciones push en tu dispositivo</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={pushNotifications}
                                onChange={(e) => setPushNotifications(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Tipos de notificaciones */}
            <div>
                <h3 className="text-lg font-semibold text-[#212121] mb-4">Avisarme sobre</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={notifyStatusChange}
                            onChange={(e) => setNotifyStatusChange(e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <p className="font-medium text-[#212121]">Cambios de estado en mis solicitudes</p>
                            <p className="text-sm text-gray-600">Aprobada, Rechazada, En revisión</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={notifyReminders}
                            onChange={(e) => setNotifyReminders(e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <p className="font-medium text-[#212121]">Recordatorios de vacaciones próximas</p>
                            <p className="text-sm text-gray-600">Te avisaremos antes de tus vacaciones programadas</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={notifyAnnouncements}
                            onChange={(e) => setNotifyAnnouncements(e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <p className="font-medium text-[#212121]">Anuncios de la empresa o RRHH</p>
                            <p className="text-sm text-gray-600">Comunicados importantes y actualizaciones</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    )
}

// Sección de Apariencia
function AppearanceSection({ language, setLanguage, theme, setTheme }: any) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-[#212121] mb-6">Preferencias de Apariencia</h2>

            {/* Idioma */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#212121] mb-4">Idioma</h3>
                <div className="relative">
                    <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>

            {/* Tema */}
            <div>
                <h3 className="text-lg font-semibold text-[#212121] mb-4">Tema (Apariencia)</h3>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-6 border-2 rounded-lg transition-all ${
                            theme === 'light'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Sun size={32} className={`mx-auto mb-3 ${theme === 'light' ? 'text-blue-600' : 'text-gray-600'}`} />
                        <p className="font-medium text-center">Claro</p>
                    </button>

                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-6 border-2 rounded-lg transition-all ${
                            theme === 'dark'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Moon size={32} className={`mx-auto mb-3 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-600'}`} />
                        <p className="font-medium text-center">Oscuro</p>
                    </button>

                    <button
                        onClick={() => setTheme('auto')}
                        className={`p-6 border-2 rounded-lg transition-all ${
                            theme === 'auto'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Monitor size={32} className={`mx-auto mb-3 ${theme === 'auto' ? 'text-blue-600' : 'text-gray-600'}`} />
                        <p className="font-medium text-center">Automático</p>
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                    {theme === 'auto' && 'El tema se ajustará según la configuración de tu sistema'}
                    {theme === 'light' && 'La aplicación usará el tema claro'}
                    {theme === 'dark' && 'La aplicación usará el tema oscuro'}
                </p>
            </div>
        </div>
    )
}

// Sección de Ayuda
function HelpSection() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-[#212121] mb-6">Ayuda y Soporte</h2>

            <div className="space-y-4">
                {/* Centro de Ayuda */}
                <a
                    href="#"
                    className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <HelpCircle size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[#212121]">Centro de Ayuda</h3>
                            <p className="text-gray-600">Ver Preguntas Frecuentes (FAQ)</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                </a>

                {/* Contactar Soporte */}
                <a
                    href="#"
                    className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Mail size={24} className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[#212121]">Contactar a Soporte</h3>
                            <p className="text-gray-600">Reportar un problema o solicitar ayuda</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                </a>

                {/* Acerca de */}
                <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#212121] mb-2">Acerca de</h3>
                    <div className="space-y-2 text-gray-600">
                        <p><span className="font-medium">Versión:</span> 1.0.0</p>
                        <p><span className="font-medium">Última actualización:</span> Octubre 2025</p>
                        <p className="text-sm mt-4"> 2025 Bienestar BNC. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}