import { Maximize2, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AssistantSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#212121]">¡Pulsa aquí y habla con tu asistente!</h2>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <Maximize2 size={20} className="text-gray-400" />
        </button>
      </div>

      <Link
        to="/assistant"
        className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all cursor-pointer group"
      >
        <div className="text-center">
          <Rocket size={48} className="mx-auto mb-3 text-gray-400 group-hover:text-primary transition-colors" />
          <p className="text-gray-500 group-hover:text-primary transition-colors">Click para abrir el asistente</p>
        </div>
      </Link>
    </div>
  )
}
