import React from 'react'
import { Link, useLocation } from 'react-router-dom'

type MenuItemProps = {
  icon?: React.ReactNode
  label: string
  href: string
  isCollapsed?: boolean
}

export default function MenuItem({ icon, label, href, isCollapsed = false }: MenuItemProps) {
  const location = useLocation()
  const isActive = location.pathname === href

  if (isCollapsed) {
    return (
      <Link 
        to={href} 
        className={`flex items-center justify-center p-2 w-10 h-10 rounded-lg transition-colors ${
          isActive 
            ? 'bg-[#4A90E2] text-white' 
            : 'text-[#212121] hover:bg-[#F5F5F7]'
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
          ? 'bg-[#4A90E2] text-white' 
          : 'text-[#212121] hover:bg-white'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-sm">{label}</span>
    </Link>
  )
}
