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
  getDirectReports: async (employedID: string): SupabaseResult<UserDAO[]> => {
    return from<UserDAO[]>("user", (t: any) => t.select('*').eq('reportTo', employedID))
  },
  getLevelsBelow: async (employedID: number): SupabaseResult<{ levelsBelow: number; totalSubordinates: number }> => {
    try {
      let levels = 0
      let total = 0
      let currentLevelIds: Array<number> = [employedID]

      // Iteramos por niveles descendentes usando la columna `reportTo`.
      while (true) {
        // Buscar reportes cuyo reportTo está en currentLevelIds
        const { data, error } = await supabase.from('user').select('employedID').in('reportTo', currentLevelIds)
        if (error) return { data: null, error }
        if (!data || data.length === 0) break

        // Extraer ids para el siguiente nivel
        const ids = data.map((r: any) => r.employedID)
        total += ids.length
        levels += 1
        currentLevelIds = ids
      }

      return { data: { levelsBelow: levels, totalSubordinates: total }, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  },
  getLevelsBelowWithEmail: async (email: string): SupabaseResult<{ levelsBelow: number; totalSubordinates: number }> => {
    try {
      const { data: user, error: userError } = await userDao.getByEmail(email);
      if (userError) return { data: null, error: userError };
      if (!user) return { data: null, error: 'UserDAO not found' };
      return userDao.getLevelsBelow(user.employedID);
    } catch (err) {
      return { data: null, error: err }
    }
  },
  // Calcula balance por política dividiendo en 2 periodos (periodo anterior y periodo actual)
  // - Usa la fecha de ingreso (`user.entryDate`) para prorratear el primer periodo si aplica
  // - Resta sólo las vacaciones aprobadas (campo `aprovated_at`) que cayeron dentro de cada periodo
  getVacationBalance: async (employedID: number, todayParam?: string): SupabaseResult<{
    previous: { entitlement: number; taken: number; balance: number; start: string; end: string }
    current: { entitlement: number; taken: number; balance: number; start: string; end: string }
    totalAvailable: number
  }> => {
    try {
      const today = todayParam ? new Date(todayParam) : new Date()

      // obtener usuario
      const { data: user, error: userError } = await userDao.getById(employedID)
      if (userError) return { data: null, error: userError }
      if (!user) return { data: null, error: 'UserDAO not found' }

      const entry = new Date((user as any).entryDate)

      // Helper: crear fecha de aniversario para un año concreto manteniendo mes/día del entry
      const anniversaryForYear = (year: number) => {
        const d = new Date(entry)
        d.setFullYear(year)
        // normalize time to start of day
        d.setHours(0, 0, 0, 0)
        return d
      }

      // Determinar último aniversario pasado (start of current period)
      let lastAnniv = anniversaryForYear(today.getFullYear())
      if (today < lastAnniv) {
        lastAnniv = anniversaryForYear(today.getFullYear() - 1)
      }
      const nextAnniv = anniversaryForYear(lastAnniv.getFullYear() + 1)

      const prevStart = anniversaryForYear(lastAnniv.getFullYear() - 1)
      const prevEnd = lastAnniv

      const currStart = lastAnniv
      const currEnd = nextAnniv

      const daysBetween = (a: Date, b: Date) => Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
      const daysInYear = (d: Date) => (isLeapYear(d.getFullYear()) ? 366 : 365)
      function isLeapYear(y: number) { return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0) }

      // Policy-based entitlement
      // - Right to request activates after 1 year continuous service
      // - Base: 20 days after first year
      // - +1 day for each subsequent year, capped at +15
      const entitlementForDate = (refDate: Date) => {
        // compute full years completed as of refDate
        let years = refDate.getFullYear() - entry.getFullYear()
        const refMonthDay = (m: Date) => m.getMonth() * 100 + m.getDate()
        if (refMonthDay(refDate) < refMonthDay(entry)) years -= 1
        if (years < 1) return 0
        const extra = Math.min(Math.max(0, years - 1), 15)
        return 20 + extra
      }

      // activation date (when right starts): entry + 1 year
      const activationDate = new Date(entry)
      activationDate.setFullYear(activationDate.getFullYear() + 1)

      const entitlementForPeriod = (periodStart: Date, periodEnd: Date) => {
        // If activation happens on/after periodEnd => not eligible in that period
        if (activationDate >= periodEnd) return 0
        // If activation was before or on periodStart => full entitlement based on periodStart
        if (activationDate <= periodStart) return entitlementForDate(periodStart)
        // Else activation is inside the period => prorate from activationDate to periodEnd
        const daysActive = daysBetween(activationDate, periodEnd)
        const denom = daysInYear(periodEnd)
        const full = entitlementForDate(activationDate)
        return Math.round((full * (daysActive / denom)) * 100) / 100
      }

      // obtener vacaciones aprobadas por periodo
      const fetchTaken = async (start: Date, end: Date) => {
        const { data, error } = await supabase
          .from('vacation')
          .select('days, aprovated_at')
          .eq('employedID', employedID)
          .not('aprovated_at', 'is', null)
          .gte('aprovated_at', start.toISOString())
          .lt('aprovated_at', end.toISOString())

        if (error) throw error
        return (data || []).reduce((s: number, v: any) => s + (v.days || 0), 0)
      }

      const prevEntitlement = entitlementForPeriod(prevStart, prevEnd)
      const currEntitlement = entitlementForPeriod(currStart, currEnd)

      const takenPrev = await fetchTaken(prevStart, prevEnd)
      const takenCurr = await fetchTaken(currStart, currEnd)

      const prevBalance = Math.round((prevEntitlement - takenPrev) * 100) / 100
      const currBalance = Math.round((currEntitlement - takenCurr) * 100) / 100

      const totalAvailable = Math.round((prevBalance + currBalance) * 100) / 100

      return {
        data: {
          previous: { entitlement: prevEntitlement, taken: takenPrev, balance: prevBalance, start: prevStart.toISOString(), end: prevEnd.toISOString() },
          current: { entitlement: currEntitlement, taken: takenCurr, balance: currBalance, start: currStart.toISOString(), end: currEnd.toISOString() },
          totalAvailable
        },
        error: null
      }
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
    return from<RequestDAO>("request", (t: any) => t.select('*').eq('id', id).single())
  },
  getByUserId: async (employedID: number): SupabaseResult<RequestDAO[]> => {
    return from<RequestDAO[]>("request", (t: any) => t.select('*').eq('employedID', employedID))
  },
  create: async (payload: Omit<RequestDAO, 'id' | 'created_at' | 'update_at'>): SupabaseResult<RequestDAO> => {
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
    return from<RequestRangeDAO[]>("request_range", (t: any) => t.select('*').eq('requestID', requestID))
  },
}

// Ejemplo de uso exportado por conveniencia
export default {
  userDao,
  vacationDao,
  requestDao,
  requestRangeDao
}
