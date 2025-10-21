import type { RequestDAO, RequestRangeDAO, UserDAO, VacationDAO } from "#data/dao/dao.ts"

export type Role = 'colaborador' | 'nivel2' | 'nivel1' | 'gestionHumana'

export interface User {
  employedID: number
  name: string
  area: string
  position: string
  email: string
  entryDate: Date
  reportTo: number
}
export function toUserModel(dao: UserDAO): User {
  return {
    employedID: dao.employedID,
    name: dao.name,
    area: dao.area,
    position: dao.position,
    email: dao.email,
    entryDate: new Date(dao.entryDate),
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
    entryDate: model.entryDate.toDateString(),
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
  requestID: number
  created_at: string
  update_at: string
  status: string
  senderID: number
  receiverID: number
  message?: string | null
}
export function toRequestModel(dao: RequestDAO): Request {
  return {
    requestID: dao.requestID,
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
    requestID: model.requestID,
    created_at: model.created_at,
    update_at: model.update_at,
    status: model.status,
    senderID: model.senderID,
    receiverID: model.receiverID,
    message: model.message
  }
}

export interface RequestRange {
  requestRangeID: number
  requestID: number
  start_date: Date
  end_date: Date
  days: number
}

export function toRequestRangeModel(dao: RequestRangeDAO): RequestRange {
  return {
    requestRangeID: dao.requestRangeID,
    requestID: dao.requestID,
    start_date: new Date(dao.startDate),
    end_date: new Date(dao.endDate),
    days: Math.floor((new Date(dao.endDate).getTime() - new Date(dao.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
  }
}

export function toRequestRangeDao(model: RequestRange): RequestRangeDAO {
  return {
    requestRangeID: model.requestRangeID,
    requestID: model.requestID,
    startDate: model.start_date.toDateString(),
    endDate: model.end_date.toDateString()
  }
}