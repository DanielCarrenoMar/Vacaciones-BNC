import type { Status } from "#domain/models.ts";

export type SupabaseResult<T> = Promise<{ data: T | null; error: any }>

export interface UserDAO {
  employedID: number
  name: string
  area: string
  position: string
  email: string
  entryDate: string
  reportTo: number
}

export interface VacationDAO {
  id: number
  aprovated_at: string
  startDate: string
  endDate: string
  employedID: number
}

export interface RequestDAO {
  requestID: number
  created_at: string
  update_at: string
  status: Status
  senderID: number
  receiverID: number
  message: string | null
  finalApprove: boolean
}

export interface RequestRangeDAO {
  requestRangeID: number
  requestID: number
  startDate: string
  endDate: string
  isPrimary: boolean
}