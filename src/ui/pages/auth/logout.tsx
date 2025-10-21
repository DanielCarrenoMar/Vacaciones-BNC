import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft } from 'lucide-react'
import supabase from '../../../data/supabase'

export default function LogoutPage() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(true)

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await supabase.auth.signOut()
        setIsLoggingOut(false)
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/auth/login', { replace: true })
        }, 3000)
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
        setIsLoggingOut(false)
        // Redirigir al login incluso si hay error
        setTimeout(() => {
          navigate('/auth/login', { replace: true })
        }, 3000)
      }
    }

    handleLogout()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="text-center">
        {/* Header con avatar y nombre */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <span className="text-[#212121] font-medium text-lg">Bienestar BNC</span>
          <button 
            onClick={() => navigate(-1)}
            className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Volver"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Ícono de check verde */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={40} className="text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Mensaje */}
        <p className="text-[#212121] text-lg font-medium">
          {isLoggingOut ? 'Cerrando sesión...' : 'Se ha cerrado la sesión con éxito.'}
        </p>
      </div>
    </div>
  )
}
