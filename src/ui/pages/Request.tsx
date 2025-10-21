import type { Request, RequestRange, Status, User } from '#domain/models.ts'
import { requestRangeRepo, requestRepo, userRepo } from '#repository/databaseRepositoryImpl.tsx'
import { ArrowLeft, CheckCircle, XCircle, Clock, Circle, Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface StatusConfig {
    icon: React.ReactNode;
    text: string;
    message: string;
    successMessage: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export default function Request() {
    const { id } = useParams()
    const requestID = Number(id)
    const [request, setRequest] = useState<Request>()
    const [requestPrimaryRange, setRequestPrimaryRange] = useState<RequestRange>()
    const [senderUser, setSenderUser] = useState<User>()
    const [receiver, setReceiver] = useState<User>()
    const [statusConfig, setStatusConfig] = useState<StatusConfig>()
    const navigate = useNavigate()

    const getStatusConfig = (estado: Status) => {
        switch (estado) {
            case 'approved':
                return {
                    icon: <CheckCircle size={20} />,
                    text: 'Aprobada',
                    message: 'Tu solicitud ha sido aprobada por los supervisores: [nivel1],[nivel2]',
                    successMessage: '¡Su solicitud ha sido aceptada con éxito!',
                    color: 'text-success',
                    bgColor: 'bg-success/10',
                    borderColor: 'border-success'
                }
            case 'waiting':
                return {
                    icon: <Clock size={20} />,
                    text: 'En espera',
                    message: 'Tu solicitud esta pendiente de revision por : [gerente nivel n]',
                    successMessage: 'Te notificaremos cuando se tome la decisión.',
                    color: 'text-warning',
                    bgColor: 'bg-warning/10',
                    borderColor: 'border-warning'
                }
            case 'rejected':
                return {
                    icon: <XCircle size={20} />,
                    text: 'Rechazada',
                    message: 'Los supervisores : [nivel1][nivel2], han decidido rechazar la peticion por lorem apefocijs oewjfids ofiawjofiejdoamsisjdaoojy.sdjcaojin',
                    successMessage: '',
                    color: 'text-error',
                    bgColor: 'bg-error/10',
                    borderColor: 'border-error'
                }
        }
    }

    useEffect(() => {
        async function fetchRequest() {
            const { data, error } = await requestRepo.getById(requestID)
            if (error) throw error
            if (data) setRequest(data)
            const { data: primaryRangeData, error: primaryRangeError } = await requestRangeRepo.getPrimaryByRequestId(requestID)
            if (primaryRangeError) throw primaryRangeError
            if (primaryRangeData) setRequestPrimaryRange(primaryRangeData)
        }
        async function fetchUsers() {
            if (!request) return;
            const { data: senderData, error: senderError } = await userRepo.getById(request!.senderID)
            if (senderError) throw senderError
            if (senderData) setSenderUser(senderData)

            const { data: receiverData, error: receiverError } = await userRepo.getById(request!.receiverID)
            if (receiverError) throw receiverError
            if (receiverData) setReceiver(receiverData)
        }

        async function fetchData() {
            await fetchRequest()
            await fetchUsers()
            if (request) setStatusConfig(getStatusConfig(request.status))
        } fetchData()
    }, [requestID])

    const getStepIcon = (status: Status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={24} className="text-success" />
            case 'waiting':
                return <Circle size={24} className="text-warning fill-warning" />
            case 'rejected':
                return <XCircle size={24} className="text-error" />
        }
    }

    return (
        <div className="p-6 bg-[#F5F5F7] min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header con botón de regresar y usuario */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/my-requests')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#3A7BC8] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Mis peticiones</span>
                </button>
                <div className="text-right">
                    <div className="text-sm font-medium text-[#212121]">{senderUser?.name} ({senderUser?.position})</div>
                    <div className="text-xs text-gray-500">pedrito.24@correo.com</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda: Seguimiento */}
                <div className="space-y-6">
                    {/* Seguimiento de solicitud */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-[#212121] mb-6">Seguimiento de solicitud</h2>

                        <div className="space-y-4">
                            {request?.status === 'waiting' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-0.5 h-10 mt-2 bg-warning" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-[#212121]">Solicitud creada con exito</h3>
                                        <p className="text-sm text-gray-600 mt-1">Enviada por {senderUser?.name}: {request?.created_at}</p>
                                    </div>
                                </div>
                            )}


                            {/*peticion.seguimiento.map((step, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        {getStepIcon(step.status)}
                                        {index < peticion.seguimiento.length - 1 && (
                                            <div className={`w-0.5 h-10 mt-2 ${
                                                step.status === 'completed' ? 'bg-success' :
                                                step.status === 'current' ? 'bg-warning' :
                                                'bg-gray-300'
                                            }`} />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-[#212121]">{step.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{step.subtitle}</p>
                                    </div>
                                </div>
                            ))*/}
                        </div>
                    </div>

                    {/* Botón Ver petición */}
                    <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-[#3A7BC8] transition-colors font-medium flex items-center justify-center gap-2">
                        <CalendarIcon size={20} />
                        Ver peticion
                    </button>
                </div>

                {/* Columna derecha: Estado y Detalles */}
                <div className="space-y-6">
                    {/* Estado de solicitud */}
                    <div className={`bg-white rounded-lg shadow-lg p-6 border-2 ${statusConfig?.borderColor}`}>
                        <h2 className="text-lg font-semibold text-[#212121] mb-4">Estado de solicitud</h2>

                        <div className={`flex items-center gap-2 mb-4 ${statusConfig?.color}`}>
                            {statusConfig?.icon}
                            <span className="font-semibold">{statusConfig?.text}</span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                            {statusConfig?.message}
                        </p>

                        {statusConfig?.successMessage && (
                            <p className={`text-sm font-medium ${statusConfig.color}`}>
                                {statusConfig.successMessage}
                            </p>
                        )}
                    </div>

                    {/* Detalles Solicitud */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-[#212121] mb-4">Detalles Solicitud</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total días solicitados:</span>
                                <span className="font-medium text-[#212121]">{request?.days}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fecha de inicio:</span>
                                <span className="font-medium text-[#212121]">{requestPrimaryRange?.startDate.toDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fecha de reintegro:</span>
                                <span className="font-medium text-[#212121]">{requestPrimaryRange?.endDate.toDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Periodo Vacacional:</span>
                                <span className="font-medium text-[#212121]">{requestPrimaryRange?.startDate.getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Colaborador */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-[#212121] mb-4">Informacion Colaborador</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Nombre:</span>
                                <span className="font-medium text-[#212121]">{senderUser?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Cedula:</span>
                                <span className="font-medium text-[#212121]">{senderUser?.employedID}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Cargo:</span>
                                <span className="font-medium text-[#212121]">{senderUser?.position}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Departamento:</span>
                                <span className="font-medium text-[#212121]">{senderUser?.area}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}