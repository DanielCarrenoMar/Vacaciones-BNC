import { ArrowLeft, CheckCircle, XCircle, Clock, Circle, Calendar as CalendarIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

type RequestStatus = 'aprobada' | 'en-espera' | 'rechazada'

type TrackingStep = {
    title: string
    subtitle: string
    status: 'completed' | 'current' | 'rejected' | 'pending'
}

export default function Request(){
    const navigate = useNavigate()
    const { id } = useParams()
    
    // Datos de ejemplo - estos deberían venir de una API según el ID
    const peticion = {
        id: id,
        estado: 'en-espera' as RequestStatus,
        diasSolicitados: 5,
        fechaInicio: '15/05/2025',
        fechaReintegro: '20/05/2025',
        periodoVacacional: '2025-A',
        colaborador: {
            nombre: 'Pedrito',
            cedula: 'V-12325453',
            cargo: 'Desarrollador',
            departamento: 'Frontend'
        },
        seguimiento: [
            {
                title: 'Solicitud creada con exito',
                subtitle: 'Enviada por [Colaborador]: Fecha',
                status: 'completed' as const
            },
            {
                title: 'Aprobacion Nivel 2',
                subtitle: 'Aprobado por: [supervisor nivel 1]',
                status: 'completed' as const
            },
            {
                title: 'Aprobacion Nivel 1',
                subtitle: 'En espera de aprobación',
                status: 'current' as const
            },
            {
                title: 'Procesado por RRHH',
                subtitle: 'Procesado por RRHH pendiente',
                status: 'pending' as const
            }
        ]
    }

    const getStatusConfig = (estado: RequestStatus) => {
        switch(estado) {
            case 'aprobada':
                return {
                    icon: <CheckCircle size={20} />,
                    text: 'Aprobada',
                    message: 'Tu solicitud ha sido aprobada por los supervisores: [nivel1],[nivel2]',
                    successMessage: '¡Su solicitud ha sido aceptada con éxito!',
                    color: 'text-[#2ECC71]',
                    bgColor: 'bg-[#2ECC71]/10',
                    borderColor: 'border-[#2ECC71]'
                }
            case 'en-espera':
                return {
                    icon: <Clock size={20} />,
                    text: 'En espera',
                    message: 'Tu solicitud esta pendiente de revision por : [gerente nivel n]',
                    successMessage: 'Te notificaremos cuando se tome la decisión.',
                    color: 'text-[#F39C12]',
                    bgColor: 'bg-[#F39C12]/10',
                    borderColor: 'border-[#F39C12]'
                }
            case 'rechazada':
                return {
                    icon: <XCircle size={20} />,
                    text: 'Rechazada',
                    message: 'Los supervisores : [nivel1][nivel2], han decidido rechazar la peticion por lorem apefocijs oewjfids ofiawjofiejdoamsisjdaoojy.sdjcaojin',
                    successMessage: '',
                    color: 'text-[#E74C3C]',
                    bgColor: 'bg-[#E74C3C]/10',
                    borderColor: 'border-[#E74C3C]'
                }
        }
    }

    const statusConfig = getStatusConfig(peticion.estado)

    const getStepIcon = (status: TrackingStep['status']) => {
        switch(status) {
            case 'completed':
                return <CheckCircle size={24} className="text-[#2ECC71]" />
            case 'current':
                return <Circle size={24} className="text-[#F39C12] fill-[#F39C12]" />
            case 'rejected':
                return <XCircle size={24} className="text-[#E74C3C]" />
            case 'pending':
                return <Circle size={24} className="text-gray-400" />
        }
    }

    return (
        <div className="p-6 bg-[#F5F5F7] min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header con botón de regresar y usuario */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigate('/my-requests')}
                    className="flex items-center gap-2 bg-[#4A90E2] text-white px-4 py-2 rounded-lg hover:bg-[#3A7BC8] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Mis peticiones</span>
                </button>
                <div className="text-right">
                    <div className="text-sm font-medium text-[#212121]">{peticion.colaborador.nombre} ({peticion.colaborador.cargo})</div>
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
                            {peticion.seguimiento.map((step, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        {getStepIcon(step.status)}
                                        {index < peticion.seguimiento.length - 1 && (
                                            <div className={`w-0.5 h-10 mt-2 ${
                                                step.status === 'completed' ? 'bg-[#2ECC71]' :
                                                step.status === 'current' ? 'bg-[#F39C12]' :
                                                'bg-gray-300'
                                            }`} />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-[#212121]">{step.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{step.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botón Ver petición */}
                    <button className="w-full bg-[#4A90E2] text-white py-3 rounded-lg hover:bg-[#3A7BC8] transition-colors font-medium flex items-center justify-center gap-2">
                        <CalendarIcon size={20} />
                        Ver peticion
                    </button>
                </div>

                {/* Columna derecha: Estado y Detalles */}
                <div className="space-y-6">
                    {/* Estado de solicitud */}
                    <div className={`bg-white rounded-lg shadow-lg p-6 border-2 ${statusConfig.borderColor}`}>
                        <h2 className="text-lg font-semibold text-[#212121] mb-4">Estado de solicitud</h2>
                        
                        <div className={`flex items-center gap-2 mb-4 ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span className="font-semibold">{statusConfig.text}</span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                            {statusConfig.message}
                        </p>

                        {statusConfig.successMessage && (
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
                                <span className="font-medium text-[#212121]">{peticion.diasSolicitados}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fecha de inicio:</span>
                                <span className="font-medium text-[#212121]">{peticion.fechaInicio}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fecha de reintegro:</span>
                                <span className="font-medium text-[#212121]">{peticion.fechaReintegro}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Periodo Vacacional:</span>
                                <span className="font-medium text-[#212121]">{peticion.periodoVacacional}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Colaborador */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-[#212121] mb-4">Informacion Colaborador</h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Nombre:</span>
                                <span className="font-medium text-[#212121]">{peticion.colaborador.nombre}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Cedula:</span>
                                <span className="font-medium text-[#212121]">{peticion.colaborador.cedula}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Cargo:</span>
                                <span className="font-medium text-[#212121]">{peticion.colaborador.cargo}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Departamento:</span>
                                <span className="font-medium text-[#212121]">{peticion.colaborador.departamento}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}