import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type { Permission } from "@/types/permission"
import { toPermission, type PermissionRow } from "@/adapters/permission"

export interface PermissionRepository {
  list(): Promise<Permission[]>
  getById(id: string): Promise<Permission | null>
}

export class SupabasePermissionRepository implements PermissionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<Permission[]> {
    const { data, error } = await this.client
      .from("permissions")
      .select("*")
      .order("key", { ascending: true })

    if (error) throw error
    return data.map(toPermission)
  }

  async getById(id: string): Promise<Permission | null> {
    const { data, error } = await this.client
      .from("permissions")
      .select("*")
      .eq("id", id)
      .maybeSingle<PermissionRow>()

    if (error) throw error
    return data ? toPermission(data) : null
  }
}