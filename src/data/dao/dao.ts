export type SupabaseResult<T> = Promise<{ data: T | null; error: any }>

export interface UserDAO {
  employedID: number
  name: string
  area: string
  position: string
  email: string
  entryDate: string
  reportTo?: number | null
}

export interface VacationDAO {
  id: number
  aprovated_at: string
  days: number
  employedID: number
}

export interface RequestDAO {
  id: number
  created_at: string
  update_at: string
  status: string
  senderID: number
  receiverID: number
  message?: string | null
}