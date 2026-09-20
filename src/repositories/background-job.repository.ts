import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  BackgroundJob,
  CreateBackgroundJobInput,
  UpdateBackgroundJobInput,
} from "@/types/background-job"
import {
  toBackgroundJob,
  toBackgroundJobInsert,
  toBackgroundJobUpdate,
  type BackgroundJobRow,
} from "@/adapters/background-job"

export interface BackgroundJobRepository {
  getById(id: string): Promise<BackgroundJob | null>
  listByOrganization(organizationId: string): Promise<BackgroundJob[]>
  listByUser(userId: string): Promise<BackgroundJob[]>
  create(input: CreateBackgroundJobInput): Promise<BackgroundJob>
  update(id: string, input: UpdateBackgroundJobInput): Promise<BackgroundJob>
  delete(id: string): Promise<void>
}

export class SupabaseBackgroundJobRepository implements BackgroundJobRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<BackgroundJob | null> {
    const { data, error } = await this.client
      .from("background_jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle<BackgroundJobRow>()

    if (error) throw error
    return data ? toBackgroundJob(data) : null
  }

  async listByOrganization(organizationId: string): Promise<BackgroundJob[]> {
    const { data, error } = await this.client
      .from("background_jobs")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .returns<BackgroundJobRow[]>()

    if (error) throw error
    return data.map(toBackgroundJob)
  }

  async listByUser(userId: string): Promise<BackgroundJob[]> {
    const { data, error } = await this.client
      .from("background_jobs")
      .select("*, organization_members!inner(user_id)")
      .eq("organization_members.user_id", userId)
      .order("created_at", { ascending: false })
      .returns<BackgroundJobRow[]>()

    if (error) throw error
    return data.map(toBackgroundJob)
  }

  async create(input: CreateBackgroundJobInput): Promise<BackgroundJob> {
    const { data, error } = await this.client
      .from("background_jobs")
      .insert(toBackgroundJobInsert(input))
      .select()
      .single<BackgroundJobRow>()

    if (error) throw error
    return toBackgroundJob(data)
  }

  async update(id: string, input: UpdateBackgroundJobInput): Promise<BackgroundJob> {
    const { data, error } = await this.client
      .from("background_jobs")
      .update(toBackgroundJobUpdate(input))
      .eq("id", id)
      .select()
      .single<BackgroundJobRow>()

    if (error) throw error
    return toBackgroundJob(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("background_jobs")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
