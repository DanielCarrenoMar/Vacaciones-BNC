import type { Request, RequestRange, User } from '#domain/models.ts'
import { requestRangeRepo, requestRepo, userRepo, vacationRepo } from '#repository/databaseRepositoryImpl.tsx'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pino } from 'pino'

const logger = pino()

export default function ApproveRequestDetail() {
    const { id } = useParams()
    const requestID = Number(id)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [request, setRequest] = useState<Request>()
    const [requestPrimaryRange, setRequestPrimaryRange] = useState<RequestRange>()
    const [senderUser, setSenderUser] = useState<User>()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchData() {
            // 1. Fetch Request
            const { data: requestData, error: requestError } = await requestRepo.getById(requestID)
            if (requestError) throw requestError
            if (!requestData) return
            setRequest(requestData)

            // 2. Fetch Primary Range
            const { data: primaryRangeData, error: primaryRangeError } = await requestRangeRepo.getPrimaryByRequestId(requestID)
            if (primaryRangeError) throw primaryRangeError
            if (primaryRangeData) {
                setRequestPrimaryRange(primaryRangeData)
                setCurrentMonth(new Date(primaryRangeData.startDate))
            }

            // 3. Fetch Users
            const { data: senderData, error: senderError } = await userRepo.getById(requestData.senderID)
            if (senderError) throw senderError
            if (senderData) setSenderUser(senderData)
        }
        fetchData()
    }, [requestID])

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

    function onApprove() {
        vacationRepo.create({
            employedID: senderUser!.employedID,
            startDate: requestPrimaryRange!.startDate.toDateString(),
            endDate: requestPrimaryRange!.endDate.toDateString()
        }).then(({error}) => {
            if (error) logger.error(error)
        })
        requestRepo.update(requestID, {
            requestID: requestID,
            status: 'approved',
            finalApprove: false
        }).then(({error}) => {
            if (error) logger.error(error)
            else navigate('/gestion/approve')
        })
    }
    function onDeny() {
        // No puede
    }

    return (
        <div className="p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header con botón de regresar y usuario */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/nivel2/review')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryVar transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Revisar peticiones</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información de la petición */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold text-onsurface mb-6">{senderUser?.name}</h1>

                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Id de empleado:</span>
                            <span className="font-medium text-onsurface">{senderUser?.employedID}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Departamento:</span>
                            <span className="font-medium text-onsurface">{senderUser?.area}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Cargo:</span>
                            <span className="font-medium text-onsurface">{senderUser?.position}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Fecha de envío:</span>
                            <span className="font-medium text-onsurface">{request?.created_at.toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Inicio vacaciones:</span>
                            <span className="font-medium text-onsurface">{requestPrimaryRange?.startDate.toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Fin vacaciones:</span>
                            <span className="font-medium text-onsurface">{requestPrimaryRange?.endDate.toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Dias Totales:</span>
                            <span className="font-medium text-onsurface">{requestPrimaryRange?.days}</span>
                        </div>
                    </div>
                </div>

                {/* Calendario */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Header del calendario */}
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-onsurface" />
                        </button>
                        <h2 className="text-lg font-semibold text-onsurface capitalize">{monthName}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronRight size={20} className="text-onsurface" />
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
                            const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                            const isSelected =
                                requestPrimaryRange &&
                                currentDate >= new Date(requestPrimaryRange.startDate) &&
                                currentDate <= new Date(requestPrimaryRange.endDate)
                            const isToday = currentDate.toDateString() === new Date().toDateString()

                            return (
                                <div
                                    key={day}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                                        ${isSelected ? 'bg-success text-white' : ''}
                                        ${isToday && !isSelected ? 'bg-gray-700 text-white' : ''}
                                        ${!isSelected && !isToday ? 'text-onsurface hover:bg-gray-100' : ''}
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
                    <ChevronLeft size={24} className="text-onsurface" />
                </button>
                <button onClick={onDeny} className="bg-error text-white px-12 py-3 rounded-lg hover:bg-error transition-colors font-medium">
                    Denegar
                </button>
                <button onClick={onApprove} className="bg-success text-white px-12 py-3 rounded-lg hover:bg-success transition-colors font-medium">
                    Aprobar
                </button>
                <button className="flex items-center gap-2 px-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight size={24} className="text-onsurface" />
                </button>
            </div>
        </div>
    )
}
