import { useEffect, useState } from 'react';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { requestRepo, requestRangeRepo, userRepo } from '#data/repository/databaseRepositoryImpl.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter, AlertTriangle, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import type { User } from '#domain/models.ts';

type TeamMemberStats = {
    user: User
    vacationDays: number
}

type MonthlyStats = {
    month: string
    totalDays: number
}

type RequestDetail = {
    id: number
    employeeName: string
    startDate: Date
    endDate: Date
    days: number
    status: string
}

type HeatMapDay = {
    date: Date
    count: number
}

export default function Statistics() {
    const { user } = useVerifyAuth()
    const [teamStats, setTeamStats] = useState<TeamMemberStats[]>([])
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
    const [requestDetails, setRequestDetails] = useState<RequestDetail[]>([])
    const [heatMapData, setHeatMapData] = useState<HeatMapDay[]>([])
    const [loading, setLoading] = useState(true)
    const [visibleDays, setVisibleDays] = useState(28) // Inicialmente 4 semanas

    // Filtros
    const [filterEmployee, setFilterEmployee] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterStartDate, setFilterStartDate] = useState<string>('')
    const [filterEndDate, setFilterEndDate] = useState<string>('')

    useEffect(() => {
        async function fetchStatistics() {
            if (!user) return
            setLoading(true)
            // Obtener miembros del equipo
            const { data: directReports } = await userRepo.getUsersBelow(user.employedID)

            if (directReports && directReports.length > 0) {
                const stats: TeamMemberStats[] = []
                const details: RequestDetail[] = []
                const monthlyData: { [key: string]: number } = {}
                const heatMap: { [key: string]: number } = {}

                // Inicializar meses
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                months.forEach(month => monthlyData[month] = 0)

                // Inicializar próximos 90 días para el mapa de calor
                const today = new Date()
                for (let i = 0; i < 90; i++) {
                    const date = new Date(today)
                    date.setDate(today.getDate() + i)
                    const dateKey = date.toISOString().split('T')[0]
                    heatMap[dateKey] = 0
                }

                for (const member of directReports) {
                    // Obtener días disponibles
                    const { data: balance } = await userRepo.getVacationBalance(member.employedID)
                    const vacDays = balance?.totalAvailable || 0
                    console.log('Vacation days for', member.name, vacDays)

                    stats.push({
                        user: member,
                        vacationDays: vacDays
                    })

                    // Obtener solicitudes
                    console.log('Fetching requests for', member.name, member.employedID)
                    const { data: requests } = await requestRepo.getBySenderId(member.employedID)
                    console.log('Requests for', member.name, requests)

                    if (requests) {
                        for (const request of requests) {
                            const { data: ranges } = await requestRangeRepo.getByRequestId(request.requestID)

                            if (ranges && ranges.length > 0) {
                                ranges.forEach(range => {
                                    const startDate = range.startDate
                                    const endDate = range.endDate

                                    // Agregar a detalles
                                    details.push({
                                        id: request.requestID,
                                        employeeName: member.name,
                                        startDate: startDate,
                                        endDate: endDate,
                                        days: range.days,
                                        status: request.status
                                    })

                                    // Agregar a estadísticas mensuales
                                    const monthIndex = startDate.getMonth()
                                    monthlyData[months[monthIndex]] += range.days

                                    // Agregar al mapa de calor (solo aprobadas)
                                    if (request.status === 'approved') {
                                        const currentDate = new Date(startDate)
                                        while (currentDate <= endDate) {
                                            const dateKey = currentDate.toISOString().split('T')[0]
                                            if (heatMap[dateKey] !== undefined) {
                                                heatMap[dateKey]++
                                            }
                                            currentDate.setDate(currentDate.getDate() + 1)
                                        }
                                    }
                                })
                            }
                        }
                    }
                }

                // Ordenar por días acumulados (mayor a menor)
                stats.sort((a, b) => b.vacationDays - a.vacationDays)

                // Convertir datos mensuales a array
                const monthlyArray = months.map(month => ({
                    month,
                    totalDays: monthlyData[month]
                }))

                // Convertir mapa de calor a array
                const heatMapArray = Object.entries(heatMap).map(([dateStr, count]) => ({
                    date: new Date(dateStr),
                    count
                }))

                setTeamStats(stats)
                setMonthlyStats(monthlyArray)
                setRequestDetails(details)
                setHeatMapData(heatMapArray)
            }
            setLoading(false)
        }
        fetchStatistics()
    }, [user])

    // Filtrar detalles de solicitudes
    const filteredDetails = requestDetails.filter(detail => {
        if (filterEmployee !== 'all' && detail.employeeName !== filterEmployee) return false
        if (filterStatus !== 'all' && detail.status !== filterStatus) return false
        if (filterStartDate && detail.startDate < new Date(filterStartDate)) return false
        if (filterEndDate && detail.endDate > new Date(filterEndDate)) return false
        return true
    })

    // Exportar a CSV
    const exportToCSV = () => {
        const headers = ['Empleado', 'Fecha Inicio', 'Fecha Fin', 'Días', 'Estado']
        const rows = filteredDetails.map(detail => [
            detail.employeeName,
            detail.startDate.toLocaleDateString('es-ES'),
            detail.endDate.toLocaleDateString('es-ES'),
            detail.days,
            detail.status
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `reporte_vacaciones_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    // Obtener color para el mapa de calor
    const getHeatColor = (count: number) => {
        if (count === 0) return 'bg-green-100'
        if (count === 1) return 'bg-green-200'
        if (count === 2) return 'bg-orange-300'
        if (count === 3) return 'bg-orange-400'
        return 'bg-red-500'
    }

    const getHeatLabel = (count: number) => {
        if (count === 0) return 'Bajo'
        if (count <= 1) return 'Normal'
        if (count <= 2) return 'Medio'
        if (count === 3) return 'Alto'
        return 'Crítico'
    }

    // Top 5 acumuladores
    const top5Accumulators = teamStats.slice(0, 5)

    // Empleados únicos para el filtro
    const uniqueEmployees = Array.from(new Set(requestDetails.map(d => d.employeeName)))

    // Helper para convertir Status a texto legible
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Aprobada'
            case 'waiting': return 'En espera'
            case 'rejected': return 'Rechazada'
            default: return status
        }
    }

    return (
        <div className="p-6 bg-background min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-onsurface mb-2">Estadísticas y Análisis</h1>
                <p className="text-sm text-gray-600">Análisis estratégico para la gestión de vacaciones del equipo</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Cargando estadísticas...</div>
                </div>
            ) : (
                <>
                    {/* Gráfico 1: Riesgo de Burnout (Top Acumuladores) */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle size={24} className="text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-onsurface">Riesgo de Bienestar</h2>
                                <p className="text-sm text-gray-600">Empleados con más días acumulados (Top 5)</p>
                            </div>
                        </div>

                        {top5Accumulators.length > 0 ? (
                            <div className="space-y-4">
                                {top5Accumulators.map((member, index) => (
                                    <div key={member.user.employedID} className="flex items-center gap-4">
                                        <div className="w-8 text-center font-semibold text-gray-500">#{index + 1}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-onsurface">{member.user.name}</span>
                                                <span className={`font-bold ${member.vacationDays > 20 ? 'text-red-600' :
                                                        member.vacationDays > 15 ? 'text-orange-600' :
                                                            'text-green-600'
                                                    }`}>
                                                    {member.vacationDays} días
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all ${member.vacationDays > 20 ? 'bg-red-500' :
                                                            member.vacationDays > 15 ? 'bg-orange-500' :
                                                                'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min((member.vacationDays / 30) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
                        )}

                        {top5Accumulators.some(m => m.vacationDays > 20) && (
                            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-sm text-orange-800">
                                    <strong>⚠️ Alerta:</strong> Hay empleados con más de 20 días acumulados.
                                    Considera animarlos a tomar vacaciones para prevenir el burnout.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Gráfico 2: Mapa de Calor de Disponibilidad */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CalendarIcon size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-onsurface">Disponibilidad del Equipo</h2>
                                <p className="text-sm text-gray-600">Carga de ausencias (Próximos 90 días)</p>
                            </div>
                        </div>

                        {/* Leyenda del mapa de calor */}
                        <div className="flex flex-wrap gap-3 mb-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-200"></div>
                                <span>Bajo (0-1)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-orange-300"></div>
                                <span>Medio (2)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-orange-400"></div>
                                <span>Alto (3)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-red-500"></div>
                                <span>Crítico (+3)</span>
                            </div>
                        </div>

                        {/* Mapa de calor simplificado por semanas */}
                        <div className="grid grid-cols-7 gap-1">
                            {heatMapData.slice(0, visibleDays).map((day, index) => (
                                <div
                                    key={index}
                                    className={`aspect-square ${getHeatColor(day.count)} rounded flex items-center justify-center text-xs font-medium hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                                    title={`${day.date.toLocaleDateString('es-ES')}: ${day.count} personas (${getHeatLabel(day.count)})`}
                                >
                                    {day.date.getDate()}
                                </div>
                            ))}
                        </div>

                        {/* Botón Ver más días */}
                        {visibleDays < 90 && (
                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={() => setVisibleDays(prev => Math.min(prev + 28, 90))}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryVar transition-colors flex items-center gap-2"
                                >
                                    <CalendarIcon size={16} />
                                    <span>Ver más días ({Math.min(28, 90 - visibleDays)} días más)</span>
                                </button>
                            </div>
                        )}

                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Tip:</strong> Los días en rojo indican alta carga de ausencias.
                                Evita aprobar nuevas solicitudes en esos días para mantener la operatividad del equipo.
                            </p>
                        </div>
                    </div>

                    {/* Gráfico 3: Histórico de Solicitudes por Mes */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp size={24} className="text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-onsurface">Demanda de Vacaciones</h2>
                                <p className="text-sm text-gray-600">Histórico de solicitudes por mes</p>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis label={{ value: 'Días Solicitados', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalDays" fill="#4A90E2" name="Días Solicitados" />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>📊 Insight:</strong> Identifica tus "meses calientes" para planificar proyectos importantes
                                en los meses con menor demanda de vacaciones.
                            </p>
                        </div>
                    </div>

                    {/* Tabla Filtrable y Exportable */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Filter size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-onsurface">Reporte Detallado</h2>
                                    <p className="text-sm text-gray-600">Filtrar y exportar solicitudes</p>
                                </div>
                            </div>
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryVar transition-colors"
                            >
                                <Download size={18} />
                                <span>Exportar CSV</span>
                            </button>
                        </div>

                        {/* Filtros */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
                                <select
                                    value={filterEmployee}
                                    onChange={(e) => setFilterEmployee(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="all">Todos</option>
                                    {uniqueEmployees.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="all">Todos</option>
                                    <option value="approved">Aprobada</option>
                                    <option value="waiting">En espera</option>
                                    <option value="rejected">Rechazada</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                                <input
                                    type="date"
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                                <input
                                    type="date"
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Empleado</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha Inicio</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha Fin</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Días</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDetails.length > 0 ? (
                                        filteredDetails.map((detail, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 text-sm text-onsurface">{detail.employeeName}</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {detail.startDate.toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {detail.endDate.toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-semibold text-onsurface">{detail.days}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${detail.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            detail.status === 'waiting' ? 'bg-orange-100 text-orange-800' :
                                                                detail.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {getStatusLabel(detail.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">
                                                No hay solicitudes que coincidan con los filtros
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            Mostrando {filteredDetails.length} de {requestDetails.length} solicitudes
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
