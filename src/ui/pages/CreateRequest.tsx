import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateRequest(){
    const navigate = useNavigate()
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 5)) // Junio 2025
    const [selectedDates, setSelectedDates] = useState<number[]>([])
    const [startDate, setStartDate] = useState<number | null>(null)
    const [endDate, setEndDate] = useState<number | null>(null)
    
    const diasDisponibles = 20

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

    const handleCreate = () => {
        // Aquí iría la lógica para crear la petición
        console.log('Crear petición con días:', selectedDates)
        navigate('/my-requests')
    }

    return (
        <div className="p-6 bg-[#F5F5F7] min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigate('/my-requests')}
                    className="flex items-center gap-2 bg-[#4A90E2] text-white px-4 py-2 rounded-lg hover:bg-[#3A7BC8] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Mis peticiones</span>
                </button>
                <div className="text-right">
                    <div className="text-sm font-medium text-[#212121]">Pedrito (Programador Frontend)</div>
                    <div className="text-xs text-gray-500">pedrito.24@correo.com</div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* Días Disponibles */}
                <div className="bg-[#4A90E2] rounded-lg p-4 mb-4 text-white inline-block">
                    <div className="text-xs mb-1">Días Disponibles</div>
                    <div className="text-4xl font-bold">{diasDisponibles}</div>
                </div>

                {/* Calendario */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                    {/* Header del calendario */}
                    <div className="flex justify-between items-center mb-4">
                        <button 
                            onClick={prevMonth} 
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={18} className="text-[#212121]" />
                        </button>
                        <h2 className="text-base font-semibold text-[#212121]">{monthName}</h2>
                        <button 
                            onClick={nextMonth} 
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={18} className="text-[#212121]" />
                        </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const isSelected = selectedDates.includes(day)
                            const isStart = day === startDate
                            const isEnd = day === endDate
                            const isMiddle = isSelected && !isStart && !isEnd
                            
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                                        ${isStart ? 'bg-[#2C5AA0] text-white shadow-md' : ''}
                                        ${isEnd ? 'bg-[#1E3A5F] text-white shadow-md' : ''}
                                        ${isMiddle ? 'bg-[#4A90E2] text-white' : ''}
                                        ${!isSelected ? 'text-[#212121] hover:bg-gray-100' : ''}
                                    `}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    {/* Leyenda */}
                    <div className="flex gap-3 mt-4 text-xs text-gray-600 justify-center">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-[#2C5AA0]"></div>
                            <span>Inicial</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-[#4A90E2]"></div>
                            <span>Intermedio</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-[#1E3A5F]"></div>
                            <span>Final</span>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={handleCancel}
                        className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-300"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={selectedDates.length === 0}
                        className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2
                            ${selectedDates.length > 0 
                                ? 'bg-[#4A90E2] text-white hover:bg-[#3A7BC8]' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <CalendarIcon size={20} />
                        Crear peticion
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