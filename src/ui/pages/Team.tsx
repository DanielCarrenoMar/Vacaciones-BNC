import { useEffect, useState } from 'react';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { requestRepo, requestRangeRepo, userRepo } from '#data/repository/databaseRepositoryImpl.tsx';
import { Users, Clock, AlertTriangle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import type { User } from '#domain/models.ts';

type TeamMember = {
    user: User
    vacationDays: number
    nextAbsence: Date | null
    pendingRequests: number
}

type VacationEvent = {
    user: User
    requestId: number
    status: string
    startDate: Date
    endDate: Date
    days: number
}

export default function Team() {
    const { user } = useVerifyAuth()
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [vacationEvents, setVacationEvents] = useState<VacationEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    
    // KPIs
    const [absentToday, setAbsentToday] = useState(0)
    const [pendingApprovals, setPendingApprovals] = useState(0)
    const [totalTeamDays, setTotalTeamDays] = useState(0)
    
    // Calendario
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    useEffect(() => {
        async function fetchTeamData() {
            if (!user) return
            setLoading(true)
            
            try {
                // Obtener miembros del equipo (reportes directos)
                const { data: directReports, error: reportsError } = await userRepo.getDirectReports(user.employedID.toString())
                if (reportsError) throw reportsError
                
                if (directReports && directReports.length > 0) {
                    const members: TeamMember[] = []
                    const events: VacationEvent[] = []
                    let totalDays = 0
                    let pending = 0
                    
                    // Para cada miembro, obtener sus datos
                    for (const member of directReports) {
                        // Obtener días disponibles
                        const { data: balance } = await userRepo.getVacationBalance(member.employedID)
                        const vacDays = balance?.totalAvailable || 0
                        totalDays += vacDays
                        
                        // Obtener solicitudes del miembro
                        const { data: requests } = await requestRepo.getBySenderId(member.employedID)
                        const pendingCount = requests?.filter(r => r.status === 'En espera').length || 0
                        pending += pendingCount
                        
                        // Obtener próxima ausencia
                        let nextAbsence: Date | null = null
                        if (requests) {
                            for (const request of requests) {
                                if (request.status === 'Aprobada') {
                                    const { data: ranges } = await requestRangeRepo.getByRequestId(request.id)
                                    if (ranges && ranges.length > 0) {
                                        const futureRanges = ranges.filter(r => new Date(r.start_date) > new Date())
                                        if (futureRanges.length > 0) {
                                            const nearest = futureRanges.sort((a, b) => 
                                                new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                                            )[0]
                                            nextAbsence = new Date(nearest.start_date)
                                            break
                                        }
                                    }
                                }
                            }
                            
                            // Agregar eventos al calendario
                            for (const request of requests) {
                                const { data: ranges } = await requestRangeRepo.getByRequestId(request.id)
                                if (ranges && ranges.length > 0) {
                                    ranges.forEach(range => {
                                        events.push({
                                            user: member,
                                            requestId: request.id,
                                            status: request.status,
                                            startDate: range.start_date,
                                            endDate: range.end_date,
                                            days: range.days
                                        })
                                    })
                                }
                            }
                        }
                        
                        members.push({
                            user: member,
                            vacationDays: vacDays,
                            nextAbsence,
                            pendingRequests: pendingCount
                        })
                    }
                    
                    // Calcular ausentes hoy
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const absent = events.filter(event => {
                        const start = new Date(event.startDate)
                        const end = new Date(event.endDate)
                        start.setHours(0, 0, 0, 0)
                        end.setHours(0, 0, 0, 0)
                        return event.status === 'Aprobada' && today >= start && today <= end
                    }).length
                    
                    setTeamMembers(members)
                    setVacationEvents(events)
                    setTotalTeamDays(totalDays)
                    setPendingApprovals(pending)
                    setAbsentToday(absent)
                }
            } catch (error) {
                console.error('Error fetching team data:', error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchTeamData()
    }, [user])

    // Navegación del calendario
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    // Generar días del calendario
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
    
    const calendarDays: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = []
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) })
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({ day, isCurrentMonth: true, date: new Date(year, month, day) })
    }
    const remainingDays = 42 - calendarDays.length
    for (let day = 1; day <= remainingDays; day++) {
        calendarDays.push({ day, isCurrentMonth: false, date: new Date(year, month + 1, day) })
    }

    // Obtener eventos para una fecha
    const getEventsForDate = (date: Date) => {
        return vacationEvents.filter(event => {
            const eventStart = new Date(event.startDate)
            const eventEnd = new Date(event.endDate)
            eventStart.setHours(0, 0, 0, 0)
            eventEnd.setHours(0, 0, 0, 0)
            date.setHours(0, 0, 0, 0)
            return date >= eventStart && date <= eventEnd
        })
    }

    // Detectar conflictos (más de 2 personas ausentes el mismo día)
    const hasConflict = (date: Date) => {
        const events = getEventsForDate(date)
        const approvedEvents = events.filter(e => e.status === 'Aprobada')
        return approvedEvents.length > 2
    }

    // Miembros en riesgo (más de 20 días acumulados)
    const membersAtRisk = teamMembers.filter(m => m.vacationDays > 20)

    return (
        <div className="h-full bg-background" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-onsurface mb-2">Gestión de Equipo</h1>
                <p className="text-sm text-gray-600">Administra las vacaciones y disponibilidad de tu equipo</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Users size={20} className="text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Ausentes Hoy</span>
                    </div>
                    <div className="text-4xl font-bold text-onsurface">{absentToday}</div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock size={20} className="text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Pendientes</span>
                    </div>
                    <div className="text-4xl font-bold text-onsurface">{pendingApprovals}</div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users size={20} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Miembros</span>
                    </div>
                    <div className="text-4xl font-bold text-onsurface">{teamMembers.length}</div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CalendarIcon size={20} className="text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Días Totales</span>
                    </div>
                    <div className="text-4xl font-bold text-onsurface">{totalTeamDays}</div>
                </div>
            </div>

            {/* Grid: Calendario + Reportes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Calendario del Equipo */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <CalendarIcon size={24} className="text-primary" />
                            <h2 className="text-xl font-semibold text-onsurface">{monthNames[month]} {year}</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-medium text-primary hover:bg-blue-50 rounded-lg">
                                Hoy
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Leyenda */}
                    <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500"></div>
                            <span className="text-gray-600">Aprobada</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-orange-400"></div>
                            <span className="text-gray-600">Pendiente</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500"></div>
                            <span className="text-gray-600">Conflicto</span>
                        </div>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">{day}</div>
                        ))}
                    </div>

                    {/* Calendario */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">Cargando...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((dayInfo, index) => {
                                const events = getEventsForDate(dayInfo.date)
                                const conflict = hasConflict(dayInfo.date)
                                const isToday = dayInfo.isCurrentMonth && dayInfo.day === new Date().getDate() && 
                                    month === new Date().getMonth() && year === new Date().getFullYear()

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-20 p-1 border rounded transition-colors ${
                                            dayInfo.isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                                        } ${isToday ? 'ring-2 ring-primary' : ''} ${conflict ? 'bg-red-50' : ''}`}
                                    >
                                        <div className={`text-xs font-medium mb-1 ${
                                            dayInfo.isCurrentMonth ? 'text-onsurface' : 'text-gray-400'
                                        } ${isToday ? 'text-primary font-bold' : ''}`}>
                                            {dayInfo.day}
                                        </div>
                                        <div className="space-y-0.5">
                                            {events.slice(0, 2).map((event, i) => (
                                                <div
                                                    key={i}
                                                    className={`text-[10px] px-1 py-0.5 rounded truncate ${
                                                        event.status === 'Aprobada' ? 'bg-green-100 text-green-800' :
                                                        event.status === 'En espera' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}
                                                    title={`${event.user.name} - ${event.status}`}
                                                >
                                                    {event.user.name.split(' ')[0]}
                                                </div>
                                            ))}
                                            {events.length > 2 && (
                                                <div className="text-[10px] text-gray-500">+{events.length - 2}</div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Reportes de Bienestar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={20} className="text-orange-500" />
                            <h3 className="font-semibold text-onsurface">Alertas de Bienestar</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-2">Riesgo de Burnout</div>
                                <div className="text-2xl font-bold text-orange-600">{membersAtRisk.length}</div>
                                <div className="text-xs text-gray-500">miembros con +20 días</div>
                            </div>
                            
                            {membersAtRisk.length > 0 && (
                                <div className="pt-3 border-t">
                                    <div className="text-xs font-medium text-gray-600 mb-2">Requieren atención:</div>
                                    <div className="space-y-2">
                                        {membersAtRisk.slice(0, 3).map(member => (
                                            <div key={member.user.employedID} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-700">{member.user.name}</span>
                                                <span className="font-semibold text-orange-600">{member.vacationDays}d</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-onsurface mb-3">Resumen Rápido</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Promedio días/persona:</span>
                                <span className="font-semibold">{teamMembers.length > 0 ? Math.round(totalTeamDays / teamMembers.length) : 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Solicitudes activas:</span>
                                <span className="font-semibold">{pendingApprovals}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Miembros del Equipo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-onsurface mb-4">Miembros del Equipo</h2>
                
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Cargando miembros...</div>
                ) : teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No hay miembros en tu equipo</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nombre</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Cargo</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Días Disponibles</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Próxima Ausencia</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.map(member => (
                                    <tr key={member.user.employedID} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                                                    {member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-onsurface">{member.user.name}</div>
                                                    <div className="text-xs text-gray-500">{member.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-700">{member.user.position}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                                member.vacationDays > 20 ? 'bg-orange-100 text-orange-800' :
                                                member.vacationDays > 10 ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {member.vacationDays} días
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-700">
                                            {member.nextAbsence 
                                                ? new Date(member.nextAbsence).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                                                : 'N/A'
                                            }
                                        </td>
                                        <td className="py-4 px-4">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical size={18} className="text-gray-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
