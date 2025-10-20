export interface User {
  employedID: string
  nombre?: string
  area?: string
  cargo?: string
  email?: string
  fecha_ingreso?: string // ISO date
}

export interface Vacation {
  id?: number
  aprovated_at?: string | null
  days: number
  employedID: string
}

export interface Peticion {
  id?: number
  created_at?: string
  update_at?: string
}