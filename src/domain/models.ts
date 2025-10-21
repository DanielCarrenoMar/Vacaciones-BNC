import type { RequestDAO, UserDAO, VacationDAO } from "#data/dao/dao.ts"

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
export function toUserModel(dao: UserDAO): User {
  return {
    employedID: dao.employedID,
    name: dao.name,
    area: dao.area,
    position: dao.position,
    email: dao.email,
    entryDate: dao.entryDate,
    reportTo: dao.reportTo
  }
}
export function toUserDao( model: User ): UserDAO {
  return {
    employedID: model.employedID,
    name: model.name,
    area: model.area,
    position: model.position,
    email: model.email,
    entryDate: model.entryDate,
    reportTo: model.reportTo
  }
}

export interface Vacation {
  id: number
  aprovated_at: string
  days: number
  employedID: number
}
export function toVacationModel(dao: VacationDAO): Vacation {
  return {
    id: dao.id,
    aprovated_at: dao.aprovated_at,
    days: dao.days,
    employedID: dao.employedID
  }
}
export function toVacationDao(model: Vacation): VacationDAO {
  return {
    id: model.id,
    aprovated_at: model.aprovated_at,
    days: model.days,
    employedID: model.employedID
  }
}

export interface Request {
  id: number
  created_at: string
  update_at: string
  status: string
  senderID: number
  receiverID: number
  message?: string | null
}
export function toRequestModel(dao: RequestDAO): Request {
  return {
    id: dao.id,
    created_at: dao.created_at,
    update_at: dao.update_at,
    status: dao.status,
    senderID: dao.senderID,
    receiverID: dao.receiverID,
    message: dao.message
  }
}
export function toRequestDao(model: Request): RequestDAO {
  return {
    id: model.id,
    created_at: model.created_at,
    update_at: model.update_at,
    status: model.status,
    senderID: model.senderID,
    receiverID: model.receiverID,
    message: model.message
  }
}