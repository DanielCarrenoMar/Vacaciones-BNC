import supabase from '../supabase'
import type { RequestRangeDAO, UserDAO, RequestDAO, VacationDAO } from './dao';
type SupabaseResult<T> = Promise<{ data: T | null; error: any }>

async function from<T>(table: string, query: (q: any) => any): SupabaseResult<T> {
  const { data, error } = await query(supabase.from(table))
  return { data: data as T | null, error }
}

export const userDao = {
  getAll: async (): SupabaseResult<UserDAO[]> => {
    return from<UserDAO[]>("user", (t: any) => t.select('*'))
  },
  getById: async (employedID: number): SupabaseResult<UserDAO> => {
    return from<UserDAO>("user", (t: any) => t.select('*').eq('employedID', employedID).single())
  },
  getByEmail: async (email: string): SupabaseResult<UserDAO> => {
    return from<UserDAO>("user", (t: any) => t.select('*').eq('email', email).single())
  },
  create: async (payload: UserDAO): SupabaseResult<UserDAO> => {
    return from<UserDAO>("user", (t: any) => t.insert(payload).select().single())
  },
  update: async (employedID: string, payload: Partial<UserDAO>): SupabaseResult<UserDAO> => {
    return from<UserDAO>("user", (t: any) => t.update(payload).eq('employedID', employedID).select().single())
  },
  remove: async (employedID: number): SupabaseResult<null> => {
    return from<null>("user", (t: any) => t.delete().eq('employedID', employedID))
  },
  // Devuelve los reportes directos (usuarios cuyo reportTo === employedID)
  getDirectReports: async (employedID: number): SupabaseResult<UserDAO[]> => {
    return from<UserDAO[]>("user", (t: any) => t.select('*').eq('reportTo', employedID))
  },
  getUsersBelow: async (employedID: number): SupabaseResult<UserDAO[]> => {
    try {
      let usersBelow: UserDAO[] = []
      let currentLevelIds: Array<number> = [employedID]
      while (currentLevelIds.length > 0) {
        const { data, error } = await supabase.from('user').select('*').in('reportTo', currentLevelIds)
        if (error) return { data: null, error }
        if (!data || data.length === 0) break
        usersBelow = usersBelow.concat(data)
        const ids = data.map((r: any) => r.employedID)
        currentLevelIds = ids
      }
      return { data: usersBelow, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  },
  getLevelsBelow: async (employedID: number): SupabaseResult<{ levelsBelow: number; totalSubordinates: number }> => {
    try {
      let levels = 0
      let total = 0
      let currentLevelIds: Array<number> = [employedID]

      while (currentLevelIds.length > 0) {
        const { data, error } = await supabase.from('user').select('employedID').in('reportTo', currentLevelIds)
        if (error) return { data: null, error }
        if (!data || data.length === 0) break

        const ids = data.map((r: any) => r.employedID)
        total += ids.length
        levels += 1
        currentLevelIds = ids
      }

      return { data: { levelsBelow: levels, totalSubordinates: total }, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }
}

// VacationDAO CRUD
export const vacationDao = {
  getAll: async (): SupabaseResult<VacationDAO[]> => {
    return from<VacationDAO[]>("vacation", (t: any) => t.select('*'))
  },
  getById: async (id: number): SupabaseResult<VacationDAO> => {
    return from<VacationDAO>("vacation", (t: any) => t.select('*').eq('id', id).single())
  },
  create: async (payload: Omit<VacationDAO, 'id'>): SupabaseResult<VacationDAO> => {
    return from<VacationDAO>("vacation", (t: any) => t.insert(payload).select().single())
  },
  update: async (id: number, payload: Partial<VacationDAO>): SupabaseResult<VacationDAO> => {
    return from<VacationDAO>("vacation", (t: any) => t.update(payload).eq('id', id).select().single())
  },
  remove: async (id: number): SupabaseResult<null> => {
    return from<null>("vacation", (t: any) => t.delete().eq('id', id))
  },
}

export const requestDao = {
  getAll: async (): SupabaseResult<RequestDAO[]> => {
    return from<RequestDAO[]>("request", (t: any) => t.select('*'))
  },
  getById: async (id: number): SupabaseResult<RequestDAO> => {
    return from<RequestDAO>("request", (t: any) => t.select('*').eq('requestID', id).single())
  },
  getBySenderId: async (employedID: number): SupabaseResult<RequestDAO[]> => {
    return from<RequestDAO[]>("request", (t: any) => t.select('*').eq('senderID', employedID))
  },
  getByReceiverId: async (employedID: number): SupabaseResult<RequestDAO[]> => {
    return from<RequestDAO[]>("request", (t: any) => t.select('*').eq('receiverID', employedID))
  },
  create: async (payload: Omit<RequestDAO, 'requestID' | 'created_at' | 'update_at'>): SupabaseResult<RequestDAO> => {
    return from<RequestDAO>("request", (t: any) => t.insert(payload).select().single())
  },
  update: async (id: number, payload: Partial<RequestDAO>): SupabaseResult<RequestDAO> => {
    return from<RequestDAO>("request", (t: any) => t.update(payload).eq('id', id).select().single())
  },
  remove: async (id: number): SupabaseResult<null> => {
    return from<null>("request", (t: any) => t.delete().eq('id', id))
  }
}

export const requestRangeDao = {
  getByRequestId: async (requestID: number): SupabaseResult<RequestRangeDAO[]> => {
    return from<RequestRangeDAO[]>("requestRange", (t: any) => t.select('*').eq('requestID', requestID))
  },
  getPrimaryByRequestId: async (requestID: number): SupabaseResult<RequestRangeDAO> => {
    return from<RequestRangeDAO>("requestRange", (t: any) => t.select('*').eq('requestID', requestID).eq('isPrimary', true).single())
  },
  getPrimaryDays: async (requestID: number): SupabaseResult<number> => {
    const { data, error } = await from<RequestRangeDAO>("requestRange", (t: any) => t.select('*').eq('requestID', requestID).eq('isPrimary', true).single())
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 para incluir ambos días
    return { data: diffDays, error: null }
  },
  create: async (payload: Omit<RequestRangeDAO, 'requestRangeID'>): SupabaseResult<RequestRangeDAO> => {
    return from<RequestRangeDAO>("requestRange", (t: any) => t.insert(payload).select().single())
  },
}

// Ejemplo de uso exportado por conveniencia
export default {
  userDao,
  vacationDao,
  requestDao,
  requestRangeDao
}
