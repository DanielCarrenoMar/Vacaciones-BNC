import { Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ReviewRequestNivel2(){
    // Datos de ejemplo - estos deberían venir de una API
    const peticiones = [
        { id: 1, emisor: 'Pedrito', fecha: '05/02/2025', diasUsados: 5 },
        { id: 2, emisor: 'Pedrito', fecha: '05/02/2025', diasUsados: 5 },
        { id: 3, emisor: 'Pedrito', fecha: '05/02/2025', diasUsados: 5 },
    ]

    const faltantes = 1

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
                    <div className="text-sm text-gray-600">Faltantes: {faltantes}</div>
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
                    {peticiones.map((peticion) => (
                        <Link
                            key={peticion.id}
                            to={`/nivel2/review/${peticion.id}`}
                            className="grid grid-cols-3 gap-4 py-4 px-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                        >
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Realizada por</span>
                                <span className="text-sm font-medium text-onsurface">{peticion.emisor}</span>
                            </div>
                            <div className="flex items-center justify-center text-sm text-gray-600">
                                {peticion.fecha}
                            </div>
                            <div className="flex items-center justify-end gap-2 text-sm text-primary">
                                <Calendar size={16} />
                                <span className="font-medium">{peticion.diasUsados} días</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}