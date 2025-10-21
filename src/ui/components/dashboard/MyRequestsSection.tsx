import type { Request } from '#domain/models.ts'
import { ChevronDown, Maximize2 } from 'lucide-react'
import MyRequestsSectionItem from './MyRequestsSectionItem'

interface MyRequestsSectionProps {
  userRequests: Request[]
}

export default function MyRequestsSection({ userRequests }: MyRequestsSectionProps) {
  return (
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
          <MyRequestsSectionItem key={request.requestID} request={request} />
        ))}
      </div>
    </div>
  )
}
