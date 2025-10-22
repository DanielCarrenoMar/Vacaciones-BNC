import React from 'react'
import { Link, useLocation } from 'react-router-dom'

type MenuItemProps = {
  icon?: React.ReactNode
  label: string
  href: string
  isCollapsed?: boolean
  onClick?: () => void
}

export default function MenuItem({ icon, label, href, isCollapsed = false, onClick }: MenuItemProps) {
  const location = useLocation()
  
  // Mejorar la detección de ruta activa
  let isActive = false
  
  // Si el href es '/' (dashboard), marcar como activo si estamos en la raíz o en cualquier ruta de dashboard
  if (href === '/') {
    isActive = location.pathname === '/' || 
               location.pathname === '/dashboard' || 
               location.pathname === '/nivel2/dashboard' || 
               location.pathname === '/nivel1/dashboard' ||
               location.pathname === '/gestion/dashboard'
  } else {
    // Para otras rutas, comparar exactamente o si es una subruta
    isActive = location.pathname === href || location.pathname.startsWith(href + '/')
  }

  if (onClick) {
    const commonClass = `flex items-center gap-3 w-full text-left rounded-lg transition-colors  cursor-pointer ${
      isActive 
        ? 'bg-primary text-white' 
        : 'text-onsurface hover:bg-white'
    }`

    if (isCollapsed) {
      return (
        <button
          onClick={onClick}
          className={`justify-center p-2 w-10 h-10 ${commonClass}`}
          title={label}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
        </button>
      )
    }

    return (
      <button
        onClick={onClick}
        className={`px-3 py-3 ${commonClass}r`}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="text-sm">{label}</span>
      </button>
    )
  }

  if (isCollapsed) {
    return (
      <Link 
        to={href} 
        className={`flex items-center justify-center p-2 w-10 h-10 rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary text-white' 
            : 'text-onsurface hover:bg-background'
        }`}
        title={label}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
      </Link>
    )
  }

  return (
    <Link 
      to={href} 
      className={`flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary text-white' 
          : 'text-onsurface hover:bg-white'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-sm">{label}</span>
    </Link>
  )
}
