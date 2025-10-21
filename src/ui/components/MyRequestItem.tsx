import type { Request, Status } from '#domain/models.ts';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type RequestItemProps = {
    request: Request;
};

const getStatusConfig = (status: Status) => {
    switch(status) {
        case 'approved':
            return {
                icon: <CheckCircle size={20} />,
                text: 'Aprobada',
                color: 'text-success',
                borderColor: 'border-success/30'
            };
        case 'waiting':
            return {
                icon: <Clock size={20} />,
                text: 'En espera',
                color: 'text-warning',
                borderColor: 'border-warning/30'
            };
        case 'rejected':
            return {
                icon: <XCircle size={20} />,
                text: 'Rechazada',
                color: 'text-error',
                borderColor: 'border-error/30'
            };
    }
}

export default function MyRequestItem({ request }: RequestItemProps) {
    const statusConfig = getStatusConfig(request.status);

    return (
        <Link
            key={request.requestID}
            to={`/request/${request.requestID}`}
            className={`w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 ${statusConfig.borderColor} hover:shadow-md transition-all`}
        >
            <div className="flex items-center gap-3">
                <div className={`${statusConfig.color}`}>
                    {statusConfig.icon}
                </div>
                <span className={`font-medium ${statusConfig.color}`}>
                    {statusConfig.text}
                </span>
            </div>
            <div className="flex items-center gap-2 text-primary">
                <Calendar size={16} />
                <span className="font-medium">{request.days} días</span>
            </div>
        </Link>
    );
}
