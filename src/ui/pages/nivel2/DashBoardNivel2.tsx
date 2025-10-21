import { useEffect, useState } from 'react';
import '@n8n/chat/style.css';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { requestRepo, userRepo } from '#repository/databaseRepositoryImpl.tsx';
import { Link } from 'react-router-dom'
import type { Request } from '#domain/models.ts';
import MyRequestsSection from '#ui/components/dashboard/MyRequestsSection.tsx';
import AssistantSection from '#components/AssistantSection.tsx';

export default function DashBoardNivel2() {
    const { user } = useVerifyAuth()
    const [vacationDays, setVacationDays] = useState<number>(0)
    const [userRequests, setUserRequests] = useState<Request[]>([])
    const [pendingReviewRequests, setPendingReviewRequests] = useState<number>(0)

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
        async function fetchPendingReviewRequests() {
            if (!user) return;
            const { data, error } = await requestRepo.getByReceiverId(user.employedID)
            if (error) throw error
            if (data) {
                // Contar solo las peticiones en espera
                const pending = data.filter(req => req.status === 'waiting').length
                setPendingReviewRequests(pending)
            }
        }

        async function fetchData() {
            await fetchUserRequests()
            await fetchVacationDays()
            await fetchPendingReviewRequests()
        } fetchData()
    }, [])

    return (
        <div className="p-6 bg-[#F5F5F7] min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Grid de secciones principales */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                {/* Tarjeta de Días Disponibles */}
                <div className="bg-[#4A90E2] text-white rounded-lg p-6">
                    <div className="text-sm mb-2">Días Disponibles</div>
                    <div className="text-5xl font-bold">{vacationDays}</div>
                </div>

                {/* Tarjeta de Peticiones Pendientes */}
                <Link
                    to="/nivel2/review"
                    className={`${
                        pendingReviewRequests > 0 
                            ? 'bg-[#FF6B6B] hover:bg-[#EE5A5A]' 
                            : 'bg-[#2ECC71] hover:bg-[#27AE60]'
                    } text-white rounded-lg p-6 shadow-sm transition-colors cursor-pointer`}
                >
                    <div className="text-sm mb-2">Peticiones Pendientes</div>
                    <div className="text-5xl font-bold">{pendingReviewRequests}</div>
                </Link>

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
                <MyRequestsSection userRequests={userRequests} />
                <AssistantSection />
            </div>
        </div>
    )
}