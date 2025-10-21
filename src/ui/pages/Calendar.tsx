import { useEffect, useState } from 'react';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { requestRepo, requestRangeRepo } from '#data/repository/databaseRepositoryImpl.tsx';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

type VacationEvent = {
    requestId: number
    status: string
    startDate: Date
    endDate: Date
    days: number
}

export default function Calendar() {
    const { user } = useVerifyAuth()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [vacationEvents, setVacationEvents] = useState<VacationEvent[]>([])
    const [loading, setLoading] = useState(true)

    // Obtener mes y año actual
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    useEffect(() => {
        async function fetchVacations() {
            if (!user) return
            setLoading(true)
            
            try {
                // Obtener todas las solicitudes del usuario
                const { data: requests, error: reqError } = await requestRepo.getBySenderId(user.employedID)
                if (reqError) throw reqError
                
                if (requests && requests.length > 0) {
                    // Para cada solicitud, obtener sus rangos de fechas
                    const events: VacationEvent[] = []
                    
                    for (const request of requests) {
                        const { data: ranges, error: rangeError } = await requestRangeRepo.getByRequestId(request.id)
                        if (rangeError) continue
                        
                        if (ranges && ranges.length > 0) {
                            ranges.forEach(range => {
                                events.push({
                                    requestId: request.id,
                                    status: request.status,
                                    startDate: range.start_date,
                                    endDate: range.end_date,
                                    days: range.days
                                })
                            })
                        }
                    }
                    
                    setVacationEvents(events)
                }
            } catch (error) {
                console.error('Error fetching vacations:', error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchVacations()
    }, [user])

    // Navegación de meses
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    // Obtener nombre del mes
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const monthName = monthNames[month]

    // Calcular días del mes
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    // Ajustar para que la semana empiece en lunes (0 = domingo -> 6, 1 = lunes -> 0)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    // Generar array de días para el calendario
    const calendarDays: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = []

    // Días del mes anterior
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i
        calendarDays.push({
            day,
            isCurrentMonth: false,
            date: new Date(year, month - 1, day)
        })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({
            day,
            isCurrentMonth: true,
            date: new Date(year, month, day)
        })
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - calendarDays.length // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
        calendarDays.push({
            day,
            isCurrentMonth: false,
            date: new Date(year, month + 1, day)
        })
    }

    // Función para verificar si una fecha tiene eventos de vacaciones
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

    // Función para obtener el color según el estado
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aprobada':
                return 'bg-green-500'
            case 'En espera':
                return 'bg-orange-400'
            case 'Posibles días':
                return 'bg-blue-400'
            case 'Rechazada':
                return 'bg-red-500'
            default:
                return 'bg-gray-400'
        }
    }

    const getStatusBorder = (status: string) => {
        switch (status) {
            case 'Aprobada':
                return 'border-green-500'
            case 'En espera':
                return 'border-orange-400'
            case 'Posibles días':
                return 'border-blue-400'
            case 'Rechazada':
                return 'border-red-500'
            default:
                return 'border-gray-400'
        }
    }

    return (
        <div className="h-full bg-[#F5F5F7]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-[#212121] mb-2">Calendario de Vacaciones</h1>
                <p className="text-sm text-gray-600">Visualiza tus solicitudes de vacaciones aprobadas, pendientes y rechazadas</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Controles del calendario */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <CalendarIcon size={24} className="text-[#4A90E2]" />
                        <h2 className="text-xl font-semibold text-[#212121]">{monthName} {year}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} className="text-[#212121]" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 text-sm font-medium text-[#4A90E2] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            Hoy
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={20} className="text-[#212121]" />
                        </button>
                    </div>
                </div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm text-gray-600">Aprobada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-400"></div>
                        <span className="text-sm text-gray-600">En espera</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-400"></div>
                        <span className="text-sm text-gray-600">Posibles días</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm text-gray-600">Rechazada</span>
                    </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendario */}
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-gray-500">Cargando calendario...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((dayInfo, index) => {
                            const events = getEventsForDate(dayInfo.date)
                            const isToday = dayInfo.isCurrentMonth &&
                                dayInfo.day === new Date().getDate() &&
                                month === new Date().getMonth() &&
                                year === new Date().getFullYear()

                            return (
                                <div
                                    key={index}
                                    className={`min-h-24 p-2 border rounded-lg transition-colors ${
                                        dayInfo.isCurrentMonth
                                            ? 'bg-white border-gray-200 hover:border-[#4A90E2]'
                                            : 'bg-gray-50 border-gray-100'
                                    } ${isToday ? 'ring-2 ring-[#4A90E2]' : ''}`}
                                >
                                    <div className={`text-sm font-medium mb-1 ${
                                        dayInfo.isCurrentMonth ? 'text-[#212121]' : 'text-gray-400'
                                    } ${isToday ? 'text-[#4A90E2] font-bold' : ''}`}>
                                        {dayInfo.day}
                                    </div>
                                    
                                    {/* Eventos de vacaciones */}
                                    <div className="space-y-1">
                                        {events.map((event, eventIndex) => (
                                            <div
                                                key={eventIndex}
                                                className={`text-xs px-2 py-1 rounded border-l-4 ${getStatusBorder(event.status)} bg-opacity-10 ${getStatusColor(event.status)}`}
                                                title={`${event.status} - ${event.days} día(s)`}
                                            >
                                                <div className="text-[#212121] font-medium truncate">
                                                    {event.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}