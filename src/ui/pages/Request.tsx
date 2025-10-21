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

            // 4. Fetch Receiver Level (niveles debajo del receptor actual)
            const { data: levelData, error: levelError } = await userRepo.getLevelsBelow(receiverData.employedID)
            if (levelError) throw levelError
            if (levelData) setReceiverLevel(levelData.levelsBelow)
        }
        fetchData()
    }, [requestID])

    // Determinar el estado de cada paso del stepper
    const getStepStatus = () => {
        // Paso 1: Solicitud creada - siempre completado
        const step1Complete = true

        // Determinar si necesita aprobación de Gestión Humana (finalApprove = true)
        const needsGestionHumana = request?.finalApprove === true

        // Paso 2: Aprobación Nivel 2 (supervisor directo)
        let step2Complete = false
        let step2Pending = false
        let step2Approver = receiverUser?.name

        // Paso 3: Aprobación Nivel 1 (gerente)
        let step3Complete = false
        let step3Pending = false
        let step3Approver = ''

        // Paso 4: Aprobación Gestión Humana
        let step4Complete = false
        let step4Pending = false

        if (needsGestionHumana) {
            // Flujo completo: Nivel 2 -> Nivel 1 -> Gestión Humana
            if (request?.status === 'approved') {
                // Todo aprobado
                step2Complete = true
                step3Complete = true
                step4Complete = true
            } else if (request?.status === 'waiting') {
                // Determinar en qué paso está
                if (receiverLevel === 2) {
                    // Esperando aprobación de Nivel 2
                    step2Pending = true
                } else if (receiverLevel === 1) {
                    // Nivel 2 aprobó, esperando Nivel 1
                    step2Complete = true
                    step3Pending = true
                    step3Approver = receiverUser?.name || ''
                } else if (receiverUser?.area === 'Gestión Humana') {
                    // Nivel 1 aprobó, esperando Gestión Humana
                    step2Complete = true
                    step3Complete = true
                    step4Pending = true
                }
            }
        } else {
            // Flujo simple: Solo Nivel 2
            if (request?.status === 'approved') {
                step2Complete = true
            } else if (request?.status === 'waiting') {
                step2Pending = true
            }
        }

        return {
            step1Complete,
            step2Complete,
            step2Pending,
            step2Approver,
            step3Complete,
            step3Pending,
            step3Approver,
            step4Complete,
            step4Pending,
            needsGestionHumana,
            isRejected: request?.status === 'rejected'
        }
    }

    const stepStatus = getStepStatus()

    return (
        <div className="p-4 md:p-6 bg-background min-h-screen pt-16 md:pt-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header con botón de regresar y usuario */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <button
                    onClick={() => navigate('/my-requests')}
                    className="flex items-center gap-2 bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-primaryVar transition-colors text-sm"
                >
                    <ArrowLeft size={18} />
                    <span className="hidden sm:inline">Mis peticiones</span>
                    <span className="sm:hidden">Atrás</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Columna izquierda: Seguimiento */}
                <div className="space-y-4 md:space-y-6">
                    {/* Seguimiento de solicitud */}
                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                        <h2 className="text-base md:text-lg font-semibold text-onsurface mb-4 md:mb-6">Seguimiento de solicitud</h2>

                        <div className="space-y-4">
                            {/* Paso 1: Solicitud creada */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <CheckCircle size={20} className="text-success" />
                                    {!stepStatus.isRejected && <div className={`w-0.5 h-10 mt-2 ${stepStatus.step2Complete || stepStatus.step2Pending ? 'bg-success' : 'bg-gray-300'}`} />}
                                    {stepStatus.isRejected && <div className="w-0.5 h-10 mt-2 bg-error" />}
                                </div>
                                <div className="flex-1 pb-2">
                                    <h3 className="font-medium text-onsurface">Solicitud creada con éxito</h3>
                                    <p className="text-sm text-gray-600 mt-1">Enviada por {senderUser?.name}: {new Date(request?.created_at ?? '').toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Paso 2: Aprobación Nivel 2 (Supervisor directo) */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    {stepStatus.step2Complete && <CheckCircle size={20} className="text-success" />}
                                    {stepStatus.step2Pending && <Clock size={20} className="text-warning" />}
                                    {!stepStatus.step2Complete && !stepStatus.step2Pending && !stepStatus.isRejected && <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                                    {stepStatus.isRejected && <XCircle size={20} className="text-error" />}
                                    {stepStatus.needsGestionHumana && !stepStatus.isRejected && (
                                        <div className={`w-0.5 h-10 mt-2 ${
                                            stepStatus.step2Complete ? 'bg-success' : 
                                            stepStatus.step2Pending ? 'bg-warning' : 
                                            'bg-gray-300'
                                        }`} />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <h3 className="font-medium text-onsurface">Aprobación nivel 2</h3>
                                    {stepStatus.step2Complete && <p className="text-sm text-success mt-1">✓ Aprobada por: {stepStatus.step2Approver}</p>}
                                    {stepStatus.step2Pending && <p className="text-sm text-warning mt-1">Tu solicitud está pendiente de revisión por: {stepStatus.step2Approver}</p>}
                                    {!stepStatus.step2Complete && !stepStatus.step2Pending && !stepStatus.isRejected && <p className="text-sm text-gray-500 mt-1">Pendiente</p>}
                                    {stepStatus.isRejected && <p className="text-sm text-error mt-1">Rechazada por: {stepStatus.step2Approver}</p>}
                                </div>
                            </div>

                            {/* Paso 3: Aprobación Nivel 1 (Gerente) - Solo si necesita Gestión Humana */}
                            {stepStatus.needsGestionHumana && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        {stepStatus.step3Complete && <CheckCircle size={20} className="text-success" />}
                                        {stepStatus.step3Pending && <Clock size={20} className="text-warning" />}
                                        {!stepStatus.step3Complete && !stepStatus.step3Pending && !stepStatus.isRejected && <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                                        {stepStatus.isRejected && <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                                        {!stepStatus.isRejected && (
                                            <div className={`w-0.5 h-10 mt-2 ${
                                                stepStatus.step3Complete ? 'bg-success' : 
                                                stepStatus.step3Pending ? 'bg-warning' : 
                                                'bg-gray-300'
                                            }`} />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-onsurface">Aprobación nivel 1</h3>
                                        {stepStatus.step3Complete && <p className="text-sm text-success mt-1">✓ Aprobada por: {stepStatus.step3Approver}</p>}
                                        {stepStatus.step3Pending && <p className="text-sm text-warning mt-1">Pendiente de revisión por: {stepStatus.step3Approver}</p>}
                                        {!stepStatus.step3Complete && !stepStatus.step3Pending && <p className="text-sm text-gray-500 mt-1">Pendiente</p>}
                                    </div>
                                </div>
                            )}

                            {/* Paso 4: Aprobación Gestión Humana - Solo si necesita */}
                            {stepStatus.needsGestionHumana && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        {stepStatus.step4Complete && <CheckCircle size={20} className="text-success" />}
                                        {stepStatus.step4Pending && <Clock size={20} className="text-warning" />}
                                        {!stepStatus.step4Complete && !stepStatus.step4Pending && <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-onsurface">Aprobación Gestión Humana</h3>
                                        {stepStatus.step4Complete && <p className="text-sm text-success mt-1">✓ Aprobada por Gestión Humana</p>}
                                        {stepStatus.step4Pending && <p className="text-sm text-warning mt-1">Pendiente de revisión por Gestión Humana</p>}
                                        {!stepStatus.step4Complete && !stepStatus.step4Pending && <p className="text-sm text-gray-500 mt-1">Pendiente</p>}
                                    </div>
                                </div>
                            )}

                            {/* Estado final: Aprobada */}
                            {request?.status === 'approved' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={20} className="text-success" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-success">Solicitud Aprobada</h3>
                                        <p className="text-sm text-gray-600 mt-1">¡Tu solicitud ha sido aprobada completamente!</p>
                                    </div>
                                </div>
                            )}

                            {/* Estado final: Rechazada */}
                            {request?.status === 'rejected' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <XCircle size={20} className="text-error" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <h3 className="font-medium text-error">Solicitud Rechazada</h3>
                                        <p className="text-sm text-gray-600 mt-1">Tu solicitud ha sido rechazada.</p>
                                        {request.message && <p className="text-sm text-gray-500 mt-1">Motivo: {request.message}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botón Ver petición */}
                    <button className="w-full bg-primary text-white py-2.5 md:py-3 rounded-lg hover:bg-primaryVar transition-colors font-medium flex items-center justify-center gap-2 text-sm md:text-base">
                        <CalendarIcon size={18} />
                        Ver peticion
                    </button>
                </div>

                {/* Columna derecha: Estado y Detalles */}
                <div className="space-y-4 md:space-y-6">
                    {/* Estado de solicitud */}
                    <div className={`bg-white rounded-lg shadow-lg p-4 md:p-6 border-2 ${request?.status === 'approved' ? 'border-success' : request?.status === 'waiting' ? 'border-warning' : 'border-error'}`}>
                        <h2 className="text-base md:text-lg font-semibold text-onsurface mb-4">Estado de solicitud</h2>

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
                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                        <h2 className="text-base md:text-lg font-semibold text-onsurface mb-4">Detalles Solicitud</h2>

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
                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                        <h2 className="text-base md:text-lg font-semibold text-onsurface mb-4">Informacion Colaborador</h2>

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