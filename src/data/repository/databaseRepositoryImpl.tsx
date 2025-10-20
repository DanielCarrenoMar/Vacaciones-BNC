import type { Peticion, User, Vacation } from '#domain/models.ts';
import supabase from '../supabase'
type SupabaseResult<T> = Promise<{ data: T | null; error: any }>

// Helpers genéricos
async function from<T>(table: string, query: (q: any) => any): SupabaseResult<T> {
  const { data, error } = await query(supabase.from(table))
  return { data: data as T | null, error }
}

// User CRUD
export const userRepo = {
  getAll: async (): SupabaseResult<User[]> => {
    return from<User[]>("user", (t: any) => t.select('*'))
  },
  getById: async (employedID: number): SupabaseResult<User> => {
    return from<User>("user", (t: any) => t.select('*').eq('employedID', employedID).single())
  },
  getByEmail: async (email: string): SupabaseResult<User> => {
    return from<User>("user", (t: any) => t.select('*').eq('email', email).single())
  },
  create: async (payload: User): SupabaseResult<User> => {
    return from<User>("user", (t: any) => t.insert(payload).select().single())
  },
  update: async (employedID: string, payload: Partial<User>): SupabaseResult<User> => {
    return from<User>("user", (t: any) => t.update(payload).eq('employedID', employedID).select().single())
  },
  remove: async (employedID: number): SupabaseResult<null> => {
    return from<null>("user", (t: any) => t.delete().eq('employedID', employedID))
  },
  // Devuelve los reportes directos (usuarios cuyo reportTo === employedID)
  getDirectReports: async (employedID: string): SupabaseResult<User[]> => {
    return from<User[]>("user", (t: any) => t.select('*').eq('reportTo', employedID))
  },
  // Calcula cuántos niveles hay por debajo del usuario (altura del sub-árbol)
  // y el número total de subordinados directos + indirectos.
  // Devuelve { levelsBelow, totalSubordinates } dentro de data.
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
  }
}

// Vacation CRUD
export const vacationRepo = {
  getAll: async (): SupabaseResult<Vacation[]> => {
    return from<Vacation[]>("vacation", (t: any) => t.select('*'))
  },
  getById: async (id: number): SupabaseResult<Vacation> => {
    return from<Vacation>("vacation", (t: any) => t.select('*').eq('id', id).single())
  },
  create: async (payload: Omit<Vacation, 'id'>): SupabaseResult<Vacation> => {
    return from<Vacation>("vacation", (t: any) => t.insert(payload).select().single())
  },
  update: async (id: number, payload: Partial<Vacation>): SupabaseResult<Vacation> => {
    return from<Vacation>("vacation", (t: any) => t.update(payload).eq('id', id).select().single())
  },
  remove: async (id: number): SupabaseResult<null> => {
    return from<null>("vacation", (t: any) => t.delete().eq('id', id))
  }
}

// Peticion CRUD
export const peticionRepo = {
  getAll: async (): SupabaseResult<Peticion[]> => {
    return from<Peticion[]>("peticion", (t: any) => t.select('*'))
  },
  getById: async (id: number): SupabaseResult<Peticion> => {
    return from<Peticion>("peticion", (t: any) => t.select('*').eq('id', id).single())
  },
  create: async (payload: Omit<Peticion, 'id' | 'created_at' | 'update_at'>): SupabaseResult<Peticion> => {
    return from<Peticion>("peticion", (t: any) => t.insert(payload).select().single())
  },
  update: async (id: number, payload: Partial<Peticion>): SupabaseResult<Peticion> => {
    return from<Peticion>("peticion", (t: any) => t.update(payload).eq('id', id).select().single())
  },
  remove: async (id: number): SupabaseResult<null> => {
    return from<null>("peticion", (t: any) => t.delete().eq('id', id))
  }
}

// Ejemplo de uso exportado por conveniencia
export default {
  userRepo,
  vacationRepo,
  peticionRepo
}
