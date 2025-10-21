import type { Request, User } from '#domain/models.ts';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { requestRepo, userRepo } from '#repository/databaseRepositoryImpl.tsx';
import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

interface RequestWithSender extends Request {
    senderName: string;
    senderEmail: string;
}

export default function ReviewRequestNivel2(){
    const { user } = useVerifyAuth()
    const [pendingReviewRequests, setPendingReviewRequests] = useState<RequestWithSender[]>([])

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            // 1. Obtener las peticiones pendientes
            const { data: requests, error: reqError } = await requestRepo.getByReceiverId(user.employedID);
            if (reqError) {
                console.error(reqError);
                return;
            }
            if (!requests) return;

            const pending = requests.filter(req => req.status === 'waiting');

            // 2. Para cada petición, obtener la información del emisor
            const requestsWithSenders = await Promise.all(
                pending.map(async (request) => {
                    const { data: sender, error: userError } = await userRepo.getById(request.senderID);
                    if (userError) {
                        console.error(userError);
                        // Devolver la petición original si no se encuentra el emisor
                        return { ...request, senderName: 'Usuario no encontrado', senderEmail: '' };
                    }
                    // Combinar la información
                    return { ...request, senderName: sender?.name || 'Desconocido', senderEmail: sender?.email || '' };
                })
            );
            
            setPendingReviewRequests(requestsWithSenders);
        }

        fetchData();
    }, [user])

    return (
        <div className="p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header con información del usuario */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-primary">Revisar Peticiones</h1>
                <div className="text-right">
                    <div className="text-sm font-medium text-onsurface">Líder Nivel 1</div>
                    <div className="text-xs text-gray-500">lider.nivel1@correo.com</div>
                </div>
            </div>

            {/* Contenedor principal */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Header de la tabla */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-onsurface">Peticiones por Revisar</h2>
                    <div className="text-sm text-gray-600">Faltantes: {pendingReviewRequests.length}</div>
                </div>

                {/* Encabezados de columnas */}
                <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Emisor</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <span className="text-sm font-medium text-gray-600">Fecha</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-medium text-gray-600">Días Usados</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Lista de peticiones */}
                <div className="space-y-3">
                    {pendingReviewRequests.map((request) => (
                        <Link
                            key={request.requestID}
                            to={`/nivel2/review/${request.requestID}`}
                            className="grid grid-cols-3 gap-4 py-4 px-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                        >
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Realizada por</span>
                                <span className="text-sm font-medium text-onsurface">{request.senderName}</span>
                            </div>
                            <div className="flex items-center justify-center text-sm text-gray-600">
                                {request.created_at.toLocaleDateString()}
                            </div>
                            <div className="flex items-center justify-end gap-2 text-sm text-primary">
                                <Calendar size={16} />
                                <span className="font-medium">{request.days} días</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}