import { useEffect, useState } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { requestRepo, userRepo } from '#repository/databaseRepositoryImpl.tsx';
import { Clock, CheckCircle, TrendingUp, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Request } from '#domain/models.ts';

export default function DashBoard(){
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
            const { data, error } = await requestRepo.getByUserId(user.employedID)
            if (error) throw error
            if (data) setUserRequests(data)
        }

        async function fetchData() {
            await fetchUserRequests()
            await fetchVacationDays()
        } fetchData()
    }, [])

    useEffect(() => {
        // Esto inicializa el chatbot y crea el ícono flotante.
        // La librería se encarga de mostrar/ocultar el chat al hacer clic.
        createChat({
            webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
            webhookConfig: {
                method: 'POST',
                headers: {}
            },
            target: '#n8n-chat',
            mode: 'window',
            chatInputKey: 'chatInput',
            chatSessionKey: 'sessionId',
            loadPreviousSession: true,
            metadata: {},
            showWelcomeScreen: false,
            defaultLanguage: 'es',
            initialMessages: [
                'Hola soy tu Asistente Vacacional',
                'En que te puedo ayudar hoy?'
            ],
            i18n: {
                es: {
                    title: '¡Hola! 👋',
                    subtitle: "Inicia un chat. Estamos aquí para ayudarte 24/7.",
                    footer: '',
                    getStarted: 'New Conversation',
                    inputPlaceholder: 'Type your question..',
                },
            },
            enableStreaming: false,
        });
    }, []);

    return (
        <div className="p-6 bg-[#F5F5F7] min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header con información del usuario */}
            <div className="flex justify-end mb-6">
                <div className="text-right">
                    <div className="text-sm font-medium text-[#212121]">Agustín (Líder Nivel 2)</div>
                    <div className="text-xs text-gray-500">agustin.25@correo.com</div>
                </div>
            </div>

            {/* Grid de secciones principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Tarjeta de Peticiones por Revisar */}
                <div className="bg-[#4A90E2] text-white rounded-lg p-6">
                    <div className="text-sm mb-2">Peticiones por Revisar</div>
                    <div className="text-5xl font-bold">peticionesPorRevisar</div>
                </div>

                {/* Tarjeta de Estadísticas */}
                <Link 
                    to="/statistics"
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4A90E2]"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={24} className="text-[#4A90E2]" />
                        <h3 className="text-lg font-semibold text-[#212121]">Estadísticas</h3>
                    </div>
                    <p className="text-sm text-gray-600">Ver métricas y reportes</p>
                </Link>

                {/* Tarjeta de Asistente */}
                <Link 
                    to="/assistant"
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4A90E2]"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Rocket size={24} className="text-[#4A90E2]" />
                        <h3 className="text-lg font-semibold text-[#212121]">Asistente</h3>
                    </div>
                    <p className="text-sm text-gray-600">Ayuda y soporte inteligente</p>
                </Link>
            </div>

            {/* Sección de Revisar Peticiones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#212121] mb-4">Revisar Peticiones</h2>
                
                {/* Encabezados */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Estado</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Días Usados</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Lista de peticiones */}
                <div className="space-y-3">
                    {userRequests.map((request) => (
                        <Link 
                            key={request.id} 
                            to={`/nivel1/review/${request.id}`}
                            className="flex justify-between items-center py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                {request.status === 'Por revisar' ? (
                                    <Clock size={20} className="text-gray-400" />
                                ) : (
                                    <CheckCircle size={20} className="text-[#2ECC71]" />
                                )}
                                <span className="text-sm text-[#212121]">{request.status}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#4A90E2]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>XX días</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}