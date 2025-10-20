import React from 'react'
import { Link } from 'react-router-dom'

type MenuItemProps = {
  icon?: React.ReactNode
  label: string
  href: string
}

export default function MenuItem({ icon, label, href }: MenuItemProps) {
  return (
    <Link to={href} className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-gray-100 rounded">
      {icon && <span className="w-6 h-6">{icon}</span>}
      <span className="text-sm">{label}</span>
    </Link>
  )
}
