import type { Request, RequestRange, User, Vacation } from '#domain/models.ts'
import { requestRangeRepo, requestRepo, userRepo, vacationRepo } from '#repository/databaseRepositoryImpl.tsx'
import { ArrowLeft, CheckCircle, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function Request() {
    const { id } = useParams()
    const requestID = Number(id)
    const [request, setRequest] = useState<Request>()
    const [requestPrimaryRange, setRequestPrimaryRange] = useState<RequestRange>()
    const [senderUser, setSenderUser] = useState<User>()
    const [receiverUser, setReceiverUser] = useState<User>()
    const [receiverLevel, setReceiverLevel] = useState<number>()
    const [vacationApproved, setVacationApproved] = useState<Vacation>()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchData() {
            // 1. Fetch Request
            const { data: requestData, error: requestError } = await requestRepo.getById(requestID)
            if (requestError) throw requestError
            if (!requestData) return
            setRequest(requestData)

            if (requestData.status === 'approved') {
                const { data: vacationData, error: vacationError } = await vacationRepo.getByRequestId(requestID)
                if (vacationError) throw vacationError
                if (vacationData) setVacationApproved(vacationData)
            }

            // 2. Fetch Primary Range
            const { data: primaryRangeData, error: primaryRangeError } = await requestRangeRepo.getPrimaryByRequestId(requestID)
            if (primaryRangeError) throw primaryRangeError
            if (primaryRangeData) setRequestPrimaryRange(primaryRangeData)

            // 3. Fetch Users
            const { data: senderData, error: senderError } = await userRepo.getById(requestData.senderID)
            if (senderError) throw senderError
            if (senderData) setSenderUser(senderData)

            const { data: receiverData, error: receiverError } = await userRepo.getById(requestData.receiverID)
            if (receiverError) throw receiverError
            if (!receiverData) return
            setReceiverUser(receiverData)

            // 4. Fetch Receiver Level
            const { data: levelData, error: levelError } = await userRepo.getLevelsBelow(receiverData.employedID)
            if (levelError) throw levelError
            if (levelData) setReceiverLevel(levelData.levelsBelow)
        }
        fetchData()
    }, [requestID])

    return (
        <div className="p-6 bg-background min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header con botón de regresar y usuario */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/my-requests')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryVar transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Mis peticiones</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda: Seguimiento */}
                <div className="space-y-6">
                    {/* Seguimiento de solicitud */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-onsurface mb-6">Seguimiento de solicitud</h2>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <CheckCircle size={20} className="text-success" />
                                    <div className={`w-0.5 h-10 mt-2 ${receiverLevel == 2 ? 'bg-warning' : request?.status === 'rejected' ? 'bg-error' : 'bg-success'}`} />
                                </div>
                                <div className="flex-1 pb-2">
                                    <h3 className="font-medium text-onsurface">Solicitud creada con éxito</h3>
                                    <p className="text-sm text-gray-600 mt-1">Enviada por {senderUser?.name}: {new Date(request?.created_at ?? '').toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    {
                                        receiverLevel == 1 ? (
                                            <Clock size={20} className="text-warning" />
                                        ) : (
                                            <CheckCircle size={20} className="text-success" />
                                        )
                                    }
                                    <div className={`w-0.5 h-10 mt-2 ${receiverLevel == 2 ? 'bg-warning' : request?.status === 'rejected' ? 'bg-error' : 'bg-success'}`} />
                                </div>
                                <div className="flex-1 pb-2">
                                    <h3 className="font-medium text-onsurface">Aprobacion nivel 2</h3>
                                    <p className="text-sm text-gray-600 mt-1">Tu solicitud está pendiente de revisión por: {receiverUser?.name}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    {
                                        receiverLevel == 2 ? (
                                            <Clock size={20} className="text-warning" />
                                        ) : (
                                            <CheckCircle size={20} className="text-success" />
                                        )
                                    }
                                    <div className={`w-0.5 h-10 mt-2 ${(receiverLevel == 2 && receiverUser?.area == "Gestión Humana") ? 'bg-warning' : request?.status === 'rejected' ? 'bg-error' : 'bg-success'}`} />
                                </div>
                                <div className="flex-1 pb-2">
                                    <h3 className="font-medium text-onsurface">Aprobacion nivel 1</h3>
                                    <p className="text-sm text-gray-600 mt-1">Tu solicitud está pendiente de revisión por: {receiverUser?.name}</p>
                                </div>
                            </div>

                            {/* Aprobada */}
                            {request?.status === 'approved' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={20} className="text-success" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-onsurface">Solicitud Aprobada</h3>
                                        <p className="text-sm text-gray-600 mt-1">Tu solicitud ha sido aprobada por: {receiverUser?.name}</p>
                                    </div>
                                </div>
                            )}

                            {/* Rechazada */}
                            {request?.status === 'rejected' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <XCircle size={20} className="text-error" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-onsurface">Solicitud Rechazada</h3>
                                        <p className="text-sm text-gray-600 mt-1">El supervisor {receiverUser?.name} ha decidido rechazar la petición.</p>
                                        {request.message && <p className="text-sm text-gray-500 mt-1">Motivo: {request.message}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botón Ver petición */}
                    <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primaryVar transition-colors font-medium flex items-center justify-center gap-2">
                        <CalendarIcon size={20} />
                        Ver peticion
                    </button>
                </div>

                {/* Columna derecha: Estado y Detalles */}
                <div className="space-y-6">
                    {/* Estado de solicitud */}
                    <div className={`bg-white rounded-lg shadow-lg p-6 border-2 ${request?.status === 'approved' ? 'border-success' : request?.status === 'waiting' ? 'border-warning' : 'border-error'}`}>
                        <h2 className="text-lg font-semibold text-onsurface mb-4">Estado de solicitud</h2>

                        <div className={`flex items-center gap-2 mb-4 ${request?.status === 'approved' ? 'text-success' : request?.status === 'waiting' ? 'text-warning' : 'text-error'}`}>
                            {request?.status === 'approved' && <CheckCircle size={20} />}
                            {request?.status === 'waiting' && <Clock size={20} />}
                            {request?.status === 'rejected' && <XCircle size={20} />}
                            <span className="font-semibold">{request?.status === 'approved' ? 'Aprobada' : request?.status === 'waiting' ? 'En espera' : 'Rechazada'}</span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                            {request?.status === 'approved' && `Tu solicitud ha sido aprobada por: ${receiverUser?.name}`}
                            {request?.status === 'waiting' && `Tu solicitud esta pendiente de revision por: ${receiverUser?.name}`}
                            {request?.status === 'rejected' && `El Superior: ${receiverUser?.name}, ha decidido rechazar la peticion`}
                        </p>

                        {request?.status === 'approved' && (
                            <p className={'text-sm font-medium text-success'}>
                                ¡Su solicitud ha sido aceptada con éxito!
                            </p>
                        )}
                        {request?.status === 'waiting' && (
                            <p className={'text-sm font-medium text-warning'}>
                                Te notificaremos cuando se tome la decisión.
                            </p>
                        )}
                        {request?.status === 'approved' && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Bono vacacional:</span>
                                <span className="font-medium text-onsurface">{vacationApproved?.bonus}</span>
                            </div>
                        )}
                    </div>

                    {/* Detalles Solicitud */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-onsurface mb-4">Detalles Solicitud</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total días solicitados:</span>
                                <span className="font-medium text-onsurface">{request?.days}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fecha de inicio:</span>
                                <span className="font-medium text-onsurface">{requestPrimaryRange?.startDate.toDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fecha de reintegro:</span>
                                <span className="font-medium text-onsurface">{requestPrimaryRange?.endDate.toDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Periodo Vacacional:</span>
                                <span className="font-medium text-onsurface">{requestPrimaryRange?.startDate.getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Colaborador */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-onsurface mb-4">Informacion Colaborador</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Nombre:</span>
                                <span className="font-medium text-onsurface">{senderUser?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Id de empleado:</span>
                                <span className="font-medium text-onsurface">{senderUser?.employedID}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Cargo:</span>
                                <span className="font-medium text-onsurface">{senderUser?.position}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Departamento:</span>
                                <span className="font-medium text-onsurface">{senderUser?.area}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}