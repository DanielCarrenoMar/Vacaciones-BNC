import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx'
import { requestRangeRepo, requestRepo, userRepo } from '#repository/databaseRepositoryImpl.tsx'
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { pino } from 'pino'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const logger = pino()

export default function CreateRequest(){
    const { user, userRole } = useVerifyAuth()
    const navigate = useNavigate()
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDates, setSelectedDates] = useState<number[]>([])
    const [startDate, setStartDate] = useState<number | null>(null)
    const [endDate, setEndDate] = useState<number | null>(null)
    const [vacationDays, setVacationDays] = useState<number>(0)

    useEffect(() => {
            async function fetchVacationDays() {
                if (!user) return;
                const { data, error } = await userRepo.getVacationBalance(user.employedID)
                if (error) throw error
                if (data) setVacationDays(data.totalAvailable)
            }
            async function fetchData() {
                await fetchVacationDays()
            } fetchData()
        }, [])

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return { firstDay, daysInMonth }
    }

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
        setSelectedDates([])
        setStartDate(null)
        setEndDate(null)
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
        setSelectedDates([])
        setStartDate(null)
        setEndDate(null)
    }

    const handleDateClick = (day: number) => {
        const today = new Date()
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            return
        }
        if (!startDate) {
            // Primera selección - día inicial
            setStartDate(day)
            setSelectedDates([day])
        } else if (!endDate) {
            // Segunda selección - día final
            if (day < startDate) {
                // Si el día final es menor que el inicial, intercambiar
                setEndDate(startDate)
                setStartDate(day)
                const range = []
                for (let i = day; i <= startDate; i++) {
                    range.push(i)
                }
                setSelectedDates(range)
            } else {
                setEndDate(day)
                const range = []
                for (let i = startDate; i <= day; i++) {
                    range.push(i)
                }
                setSelectedDates(range)
            }
        } else {
            // Reiniciar selección
            setStartDate(day)
            setEndDate(null)
            setSelectedDates([day])
        }
    }

    const handleCancel = () => {
        setSelectedDates([])
        setStartDate(null)
        setEndDate(null)
        navigate('/my-requests')
    }

    const handleCreate = async () => {
        if (userRole === null) return
        const {data:requestData, error:requestError} = await requestRepo.create({
            senderID: user!.employedID,
            receiverID: user!.reportTo,
            status: 'waiting',
            message: `Solicitud de vacaciones desde el día ${startDate} hasta el día ${endDate}`,
            finalApprove: userRole === "nivel1"
        })
        if (requestError) {
            logger.error('Error creating request:', requestError)
            return
        }
        const {error} = await requestRangeRepo.create({
            requestID: requestData!.requestID,
            startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), startDate!).toDateString(),
            endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), endDate!).toDateString(),
            isPrimary: true
        })
        if (error) {
            logger.error('Error creating request range:', error)
            return
        }
        navigate('/my-requests')
    }

    return (
        <div className="p-4 md:p-6 bg-background min-h-screen pt-16 md:pt-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <button 
                    onClick={() => navigate('/my-requests')}
                    className="flex items-center gap-2 bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-primaryVar transition-colors text-sm"
                >
                    <ArrowLeft size={18} />
                    <span className="hidden sm:inline">Mis peticiones</span>
                    <span className="sm:hidden">Atrás</span>
                </button>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* Días Disponibles */}
                <div className="bg-primary rounded-lg p-3 md:p-4 mb-4 text-white inline-block">
                    <div className="text-xs mb-1">Días Disponibles</div>
                    <div className="text-3xl md:text-4xl font-bold">{vacationDays}</div>
                </div>

                {/* Calendario */}
                <div className="bg-white rounded-lg shadow-lg p-3 md:p-4">
                    {/* Header del calendario */}
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                        <button 
                            onClick={prevMonth} 
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={18} className="text-onsurface" />
                        </button>
                        <h2 className="text-sm md:text-base font-semibold text-onsurface">{monthName}</h2>
                        <button 
                            onClick={nextMonth} 
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={18} className="text-onsurface" />
                        </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-2">
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
                            <div key={idx} className="text-center text-xs font-semibold text-gray-600 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const isSelected = selectedDates.includes(day)
                            const isStart = day === startDate
                            const isEnd = day === endDate
                            const isMiddle = isSelected && !isStart && !isEnd
                            const today = new Date()
                            const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                            
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    disabled={isPast}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-xs md:text-sm font-medium transition-all
                                        ${isStart ? 'bg-[#2C5AA0] text-white shadow-md' : ''}
                                        ${isEnd ? 'bg-[#1E3A5F] text-white shadow-md' : ''}
                                        ${isMiddle ? 'bg-primary text-white' : ''}
                                        ${!isSelected && !isPast ? 'text-onsurface hover:bg-gray-100' : ''}
                                        ${isToday && !isSelected ? 'border-2 border-primary' : ''}
                                        ${isPast ? 'text-gray-400 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    {/* Leyenda */}
                    <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 text-xs text-gray-600 justify-center flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-[#2C5AA0]"></div>
                            <span>Inicial</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-primary"></div>
                            <span>Intermedio</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-[#1E3A5F]"></div>
                            <span>Final</span>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 md:gap-3 mt-4">
                    <button 
                        onClick={handleCancel}
                        className="flex-1 bg-white text-gray-700 px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-300 text-sm md:text-base"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={selectedDates.length < 7 || selectedDates.length > vacationDays}
                        className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm md:text-base
                            ${selectedDates.length >= 7 && selectedDates.length <= vacationDays
                                ? 'bg-primary text-white hover:bg-primaryVar' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <CalendarIcon size={18} className="hidden sm:block" />
                        <span className="sm:hidden">Crear</span>
                        <span className="hidden sm:inline">Crear peticion</span>
                    </button>
                </div>

                {/* Información de días seleccionados */}
                {selectedDates.length > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Días seleccionados: {selectedDates.length}
                        {startDate && endDate && (
                            <span className="ml-2">
                                (Del {startDate} al {endDate})
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}