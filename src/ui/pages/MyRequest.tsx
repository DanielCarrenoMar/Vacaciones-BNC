import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MyRequestItem from '#components/MyRequestItem.tsx';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { requestRepo } from '#repository/databaseRepositoryImpl.tsx';
import type { Request } from '#domain/models.ts';

export default function MyRequest() {
    const { user } = useVerifyAuth()
    const navigate = useNavigate()
    const [userRequests, setUserRequests] = useState<Request[]>([])
    useEffect(() => {
            async function fetchUserRequests() {
                if (!user) return;
                const { data, error } = await requestRepo.getWithFinalApprovedBySenderId(user.employedID)
                if (error) throw error
                if (data) setUserRequests(data)
            }
    
            async function fetchData() {
                await fetchUserRequests()
            } fetchData()
        }, [])

    return (
        <div className="p-6 bg-background min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-onsurface">Mis Peticiones</h1>
                <button
                    onClick={() => navigate('/create-request')}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primaryVar transition-colors font-medium"
                >
                    Crear Nueva
                </button>
            </div>

            <div className="flex justify-between items-center mb-6 text-sm">
                <div className="text-gray-600">Estado</div>
                <div className="flex items-center gap-2 text-gray-600">
                    <span>Días Usados</span>
                    <Calendar size={16} className="text-gray-400" />
                </div>
            </div>

            <div className="space-y-4">
                {userRequests.map((request) => (
                    <MyRequestItem
                        key={request.requestID}
                        request={request}
                    />
                ))}
            </div>
        </div>
    )
}