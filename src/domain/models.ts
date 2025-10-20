export type Role = 'colaborador' | 'nivel2' | 'nivel1' | 'gestionHumana'

export interface User {
  employedID: number
  name: string
  area: string
  position: string
  email: string
  entryDate: string
  reportTo?: number | null
}

export interface Vacation {
  id: number
  aprovated_at: string
  days: number
  employedID: number
}

export interface Peticion {
  id: number
  created_at: string
  update_at: string
  status: string
  senderID: number
  receiverID: number
  message?: string | null
}