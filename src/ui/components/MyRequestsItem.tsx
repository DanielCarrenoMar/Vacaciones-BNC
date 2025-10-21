import type { Request } from '#domain/models.ts'
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface MyRequestsItemProps {
  request: Request
}

export default function MyRequestsItem({ request }: MyRequestsItemProps) {
  return (
    <Link
      key={request.requestID}
      to={`/request/${request.requestID}`}
      className="flex justify-between items-center py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {request.status === 'waiting' && (
          <>
            <Clock size={20} className="text-orange-400" />
            <span className="text-sm text-[#212121]">En espera</span>
          </>
        )}
        {request.status === 'rejected' && (
          <>
            <XCircle size={20} className="text-gray-400" />
            <span className="text-sm text-error">Rechazada</span>
          </>
        )}
        {request.status === 'approved' && (
          <>
            <CheckCircle size={20} className="text-[#2ECC71]" />
            <span className="text-sm text-[#212121]">Aprobada</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-[#4A90E2]">
        <Calendar size={16} />
        <span>{request.days} días</span>
      </div>
    </Link>
  )
}
