import { useEffect, useState } from 'react';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { requestRepo, userRepo } from '#repository/databaseRepositoryImpl.tsx';
import { Clock, CheckCircle, Rocket, ChevronDown, Maximize2, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Request } from '#domain/models.ts';

export default function DashBoard() {
    const { user } = useVerifyAuth()
    const [vacationDays, setVacationDays] = useState<number>(0)
    const [userRequests, setUserRequests] = useState<Request[]>([])

    useEffect(() => {
        async function fetchVacationDays() {
            if (!user) return;
            const { data, error } = await userRepo.getVacationBalance(user.employedID)
            if (error) throw error
            if (data) setVacationDays(data.totalAvailable)
        }
        async function fetchUserRequests() {
            if (!user) return;
            const { data, error } = await requestRepo.getBySenderId(user.employedID)
            if (error) throw error
            if (data) setUserRequests(data)
        }

        async function fetchData() {
            await fetchUserRequests()
            await fetchVacationDays()
        } fetchData()
    }, [])

    return (
        <div className="p-6 bg-[#F5F5F7] min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Grid de secciones principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Tarjeta de Días Disponibles */}
                <div className="bg-[#4A90E2] text-white rounded-lg p-6">
                    <div className="text-sm mb-2">Días Disponibles</div>
                    <div className="text-5xl font-bold">{vacationDays}</div>
                </div>

                {/* Tarjeta de Antigüedad */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-600 mb-2">Antigüedad</div>
                    <div className="flex items-baseline gap-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-[#212121]">{user ? new Date().getFullYear() - user.entryDate.getFullYear() : 0}</span>
                            <span className="text-lg text-gray-600">año y</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-[#212121]">{user ? new Date().getMonth() - user.entryDate.getMonth() : 0}</span>
                            <span className="text-lg text-gray-600">meses</span>
                        </div>
                    </div>
                </div>

                {/* Botón de Solicitar Vacaciones */}
                <Link
                    to="/create-request"
                    className="bg-[#4A90E2] text-white rounded-lg p-6 shadow-sm hover:bg-[#3A7BC8] transition-colors flex items-center justify-center cursor-pointer"
                >
                    <span className="text-lg font-semibold">Solicitar vacaciones</span>
                </Link>
            </div>

            {/* Grid de dos columnas para Mis Peticiones y Asistente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sección de Mis Peticiones */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-[#212121]">Mis Peticiones</h2>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <Maximize2 size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Encabezados */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Estado</span>
                            <ChevronDown size={16} className="text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Días Usados</span>
                            <ChevronDown size={16} className="text-gray-400" />
                        </div>
                    </div>

                    {/* Lista de peticiones */}
                    <div className="space-y-3">
                        {userRequests.map((request) => (
                            <Link
                                key={request.id}
                                to={`/request/${request.id}`}
                                className="flex justify-between items-center py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    {request.status === 'En espera' && (
                                        <>
                                            <Clock size={20} className="text-orange-400" />
                                            <span className="text-sm text-[#212121]">{request.status}</span>
                                        </>
                                    )}
                                    {request.status === 'Posibles días' && (
                                        <>
                                            <Clock size={20} className="text-gray-400" />
                                            <span className="text-sm text-[#212121]">{request.status}</span>
                                        </>
                                    )}
                                    {request.status === 'Aprobada' && (
                                        <>
                                            <CheckCircle size={20} className="text-[#2ECC71]" />
                                            <span className="text-sm text-[#212121]">{request.status}</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#4A90E2]">
                                    <Calendar size={16} />
                                    <span>5 días</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Sección de Asistente */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-[#212121]">¡Pulsa aquí y habla con tu asistente!</h2>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <Maximize2 size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <Link
                        to="/assistant"
                        className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#4A90E2] hover:bg-blue-50 transition-all cursor-pointer group"
                    >
                        <div className="text-center">
                            <Rocket size={48} className="mx-auto mb-3 text-gray-400 group-hover:text-[#4A90E2] transition-colors" />
                            <p className="text-gray-500 group-hover:text-[#4A90E2] transition-colors">Click para abrir el asistente</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
