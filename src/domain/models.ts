import type { RequestDAO, RequestRangeDAO, UserDAO, VacationDAO } from "#data/dao/dao.ts"

export type Role = 'colaborador' | 'nivel2' | 'nivel1' | 'gestionHumana'
export type Status = 'waiting' | 'approved' | 'rejected'

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
  startDate: Date
  endDate: Date
  days: number
  employedID: number
  requestID: number
  bonus: number
}
export function toVacationModel(dao: VacationDAO): Vacation {
  return {
    id: dao.id,
    aprovated_at: dao.aprovated_at,
    startDate: new Date(dao.startDate),
    endDate: new Date(dao.endDate),
    days: Math.floor((new Date(dao.endDate).getTime() - new Date(dao.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    employedID: dao.employedID,
    requestID: dao.requestID,
    bonus: dao.bonus
  }
}
export function toVacationDao(model: Vacation): VacationDAO {
  return {
    id: model.id,
    aprovated_at: model.aprovated_at,
    startDate: model.startDate .toDateString(),
    endDate: model.endDate.toDateString(),
    employedID: model.employedID,
    requestID: model.requestID,
    bonus: model.bonus
  }
}

export interface Request {
  requestID: number
  created_at: Date
  update_at: string
  status: Status
  senderID: number
  receiverID: number
  message: string | null
  finalApprove: boolean
  days: number
}
export function toRequestModel(dao: RequestDAO, days: number): Request {
  return {
    requestID: dao.requestID,
    created_at: new Date(dao.created_at),
    update_at: dao.update_at,
    status: dao.status as Status,
    senderID: dao.senderID,
    receiverID: dao.receiverID,
    message: dao.message,
    finalApprove: dao.finalApprove,
    days: days
  }
}
export function toRequestDao(model: Request): RequestDAO {
  return {
    requestID: model.requestID,
    created_at: model.created_at.toDateString(),
    update_at: model.update_at,
    status: model.status,
    senderID: model.senderID,
    receiverID: model.receiverID,
    message: model.message,
    finalApprove: model.finalApprove
  }
}

export interface RequestRange {
  requestRangeID: number
  requestID: number
  startDate: Date
  endDate: Date
  days: number
  isPrimary: boolean
}

export function toRequestRangeModel(dao: RequestRangeDAO): RequestRange {
  return {
    requestRangeID: dao.requestRangeID,
    requestID: dao.requestID,
    startDate: new Date(dao.startDate),
    endDate: new Date(dao.endDate),
    days: Math.floor((new Date(dao.endDate).getTime() - new Date(dao.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    isPrimary: dao.isPrimary
  }
}

export function toRequestRangeDao(model: RequestRange): RequestRangeDAO {
  return {
    requestRangeID: model.requestRangeID,
    requestID: model.requestID,
    startDate: model.startDate.toDateString(),
    endDate: model.endDate.toDateString(),
    isPrimary: model.isPrimary
  }
}