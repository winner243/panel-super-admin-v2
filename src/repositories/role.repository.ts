import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type { CreateRoleInput, Role, UpdateRoleInput } from "@/types/role"
import { toRole, toRoleInsert, toRoleUpdate, type RoleRow } from "@/adapters/role"

export interface RoleRepository {
  list(): Promise<Role[]>
  getById(id: string): Promise<Role | null>
  create(input: CreateRoleInput): Promise<Role>
  update(id: string, input: UpdateRoleInput): Promise<Role>
}

export class SupabaseRoleRepository implements RoleRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<Role[]> {
    const { data, error } = await this.client
      .from("roles")
      .select("*")
      .order("name", { ascending: true })

    if (error) throw error
    return data.map(toRole)
  }

  async getById(id: string): Promise<Role | null> {
    const { data, error } = await this.client
      .from("roles")
      .select("*")
      .eq("id", id)
      .maybeSingle<RoleRow>()

    if (error) throw error
    return data ? toRole(data) : null
  }

  async create(input: CreateRoleInput): Promise<Role> {
    const { data, error } = await this.client
      .from("roles")
      .insert(toRoleInsert(input))
      .select()
      .single<RoleRow>()

    if (error) throw error
    return toRole(data)
  }

  async update(id: string, input: UpdateRoleInput): Promise<Role> {
    const { data, error } = await this.client
      .from("roles")
      .update(toRoleUpdate(input))
      .eq("id", id)
      .select()
      .single<RoleRow>()

    if (error) throw error
    return toRole(data)
  }
}