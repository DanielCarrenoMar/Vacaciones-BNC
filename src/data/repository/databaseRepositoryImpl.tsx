import { toRequestModel, toRequestRangeModel, toUserModel, toVacationModel, type Request, type RequestRange, type User, type Vacation } from '#domain/models.ts';
import type { RequestDAO, SupabaseResult, UserDAO, VacationDAO } from '#data/dao/dao.ts';
import { userDao, vacationDao, requestDao, requestRangeDao } from '#data/dao/databaseDao.tsx';
import supabase from '#data/supabase.ts'

export const userRepo = {
  getAll: async (): SupabaseResult<User[]> => {
    const { data, error } = await userDao.getAll()
    if (error) return { data, error }
    const modelData = data!!.map(u => toUserModel(u))
    return { data: modelData, error }
  },
  getById: async (employedID: number): SupabaseResult<User> => {
    const { data, error } = await userDao.getById(employedID)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toUserModel(data)
    return { data: modelData, error: null }
  },
  getByEmail: async (email: string): SupabaseResult<User> => {
    const { data, error } = await userDao.getByEmail(email)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toUserModel(data)
    return { data: modelData, error: null }
  },
  create: async (payload: UserDAO): SupabaseResult<User> => {
    const { data, error } = await userDao.create(payload)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toUserModel(data)
    return { data: modelData, error: null }
  },
  update: async (employedID: string, payload: Partial<User>): SupabaseResult<User> => {
    const { data, error } = await userDao.update(employedID, payload)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toUserModel(data)
    return { data: modelData, error: null }
  },
  remove: async (employedID: number): SupabaseResult<null> => {
    const { data, error } = await userDao.remove(employedID)
    if (error) return { data: null, error }
    return { data: data ?? null, error: null }
  },
  // Devuelve los reportes directos (usuarios cuyo reportTo === employedID)
  getDirectReports: async (employedID: string): SupabaseResult<User[]> => {
    const { data, error } = await userDao.getDirectReports(employedID)
    if (error) return { data: null, error }
    const modelData = (data || []).map((u: any) => toUserModel(u))
    return { data: modelData, error: null }
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
      const { data: user, error: userError } = await userRepo.getByEmail(email);
      if (userError) return { data: null, error: userError };
      if (!user) return { data: null, error: 'User not found' };
      return userRepo.getLevelsBelow(user.employedID);
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
      const { data: user, error: userError } = await userRepo.getById(employedID)
      if (userError) return { data: null, error: userError }
      if (!user) return { data: null, error: 'User not found' }

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

export const vacationRepo = {
  getAll: async (): SupabaseResult<Vacation[]> => {
    const { data, error } = await vacationDao.getAll()
    if (error) return { data: null, error }
    const modelData = (data || []).map(v => toVacationModel(v))
    return { data: modelData, error: null }
  },
  getById: async (id: number): SupabaseResult<Vacation> => {
    const { data, error } = await vacationDao.getById(id)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toVacationModel(data)
    return { data: modelData, error: null }
  },
  create: async (payload: Omit<VacationDAO, 'id'>): SupabaseResult<Vacation> => {
    const { data, error } = await vacationDao.create(payload)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toVacationModel(data)
    return { data: modelData, error: null }
  },
  update: async (id: number, payload: Partial<Vacation>): SupabaseResult<Vacation> => {
    const { data, error } = await vacationDao.update(id, payload)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toVacationModel(data)
    return { data: modelData, error: null }
  },
  remove: async (id: number): SupabaseResult<null> => {
    const { data, error } = await vacationDao.remove(id)
    if (error) return { data: null, error }
    return { data: data ?? null, error: null }
  },
}

export const requestRepo = {
  getAll: async (): SupabaseResult<Request[]> => {
    const { data, error } = await requestDao.getAll()
    if (error) return { data: null, error }
    const modelData = (data || []).map(r => toRequestModel(r))
    return { data: modelData, error: null }
  },
  getById: async (id: number): SupabaseResult<Request> => {
    const { data, error } = await requestDao.getById(id)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toRequestModel(data)
    return { data: modelData, error: null }
  },
  getByUserId: async (employedID: number): SupabaseResult<Request[]> => {
    const { data, error } = await requestDao.getByUserId(employedID)
    if (error) return { data: null, error }
    const modelData = (data || []).map(r => toRequestModel(r))
    return { data: modelData, error: null }
  },
  create: async (payload: Omit<RequestDAO, 'id' | 'created_at' | 'update_at'>): SupabaseResult<Request> => {
    const { data, error } = await requestDao.create(payload)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toRequestModel(data)
    return { data: modelData, error: null }
  },
  update: async (id: number, payload: Partial<Request>): SupabaseResult<Request> => {
    const { data, error } = await requestDao.update(id, payload)
    if (error) return { data: null, error }
    if (!data) return { data: null, error: null }
    const modelData = toRequestModel(data)
    return { data: modelData, error: null }
  },
  remove: async (id: number): SupabaseResult<null> => {
    const { data, error } = await requestDao.remove(id)
    if (error) return { data: null, error }
    return { data: data ?? null, error: null }
  }
}

export const requestRangeRepo = {
  getByRequestId: async (requestID: number): SupabaseResult<RequestRange[]> => {
    const { data, error } = await requestRangeDao.getByRequestId(requestID)
    if (error) return { data: null, error }
    const modelData = (data || []).map(r => toRequestRangeModel(r))
    return { data: modelData, error: null }
  }
}

// Ejemplo de uso exportado por conveniencia
export default {
  userRepo,
  vacationRepo,
  requestRepo
}
