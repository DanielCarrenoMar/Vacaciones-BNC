import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function ReviewRequestDetailNivel2(){
    const navigate = useNavigate()
    const { id } = useParams()
    const [currentMonth, setCurrentMonth] = useState(new Date(2021, 3)) // Abril 2021
    
    // Datos de ejemplo de la petición
    const peticion = {
        nombre: 'Pedrito',
        cedula: '32.231.123',
        departamento: 'Frontend',
        cargo: 'Programador Frontend',
        fechaEnvio: '23/05/2025'
    }

    // Días seleccionados (ejemplo)
    const diasSeleccionados = [1, 14, 22, 23, 24]

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return { firstDay, daysInMonth }
    }

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)
    const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    return (
        <div className="p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header con botón de regresar y usuario */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigate('/nivel2/review')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#3A7BC8] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Revisar peticiones</span>
                </button>
                <div className="text-right">
                    <div className="text-sm font-medium text-[#212121]">Líder Nivel 1</div>
                    <div className="text-xs text-gray-500">lider.nivel1@correo.com</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información de la petición */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold text-[#212121] mb-6">{peticion.nombre}</h1>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Cédula:</span>
                            <span className="font-medium text-[#212121]">{peticion.cedula}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Departamento:</span>
                            <span className="font-medium text-[#212121]">{peticion.departamento}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Cargo:</span>
                            <span className="font-medium text-[#212121]">{peticion.cargo}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Fecha de envío:</span>
                            <span className="font-medium text-[#212121]">{peticion.fechaEnvio}</span>
                        </div>
                    </div>
                </div>

                {/* Calendario */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Header del calendario */}
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-[#212121]" />
                        </button>
                        <h2 className="text-lg font-semibold text-[#212121] capitalize">{monthName}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronRight size={20} className="text-[#212121]" />
                        </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const isSelected = diasSeleccionados.includes(day)
                            const isToday = day === 2 // Día de ejemplo como "hoy"
                            
                            return (
                                <div
                                    key={day}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                                        ${isSelected ? 'bg-success text-white' : ''}
                                        ${isToday && !isSelected ? 'bg-gray-700 text-white' : ''}
                                        ${!isSelected && !isToday ? 'text-[#212121] hover:bg-gray-100' : ''}
                                    `}
                                >
                                    {day}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-center gap-4 mt-8">
                <button className="flex items-center gap-2 px-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft size={24} className="text-[#212121]" />
                </button>
                <button className="bg-error text-white px-12 py-3 rounded-lg hover:bg-[#C0392B] transition-colors font-medium">
                    Denegar
                </button>
                <button className="bg-success text-white px-12 py-3 rounded-lg hover:bg-[#27AE60] transition-colors font-medium">
                    Aprobar
                </button>
                <button className="flex items-center gap-2 px-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight size={24} className="text-[#212121]" />
                </button>
            </div>
        </div>
    )
}
