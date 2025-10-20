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
  getById: async (employedID: string): SupabaseResult<User> => {
    return from<User>("user", (t: any) => t.select('*').eq('employedID', employedID).single())
  },
  create: async (payload: User): SupabaseResult<User> => {
    return from<User>("user", (t: any) => t.insert(payload).select().single())
  },
  update: async (employedID: string, payload: Partial<User>): SupabaseResult<User> => {
    return from<User>("user", (t: any) => t.update(payload).eq('employedID', employedID).select().single())
  },
  remove: async (employedID: string): SupabaseResult<null> => {
    return from<null>("user", (t: any) => t.delete().eq('employedID', employedID))
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
