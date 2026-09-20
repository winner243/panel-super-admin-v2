import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  ApiKey,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from "@/types/api-key"
import {
  toApiKey,
  toApiKeyInsert,
  toApiKeyUpdate,
  type ApiKeyRow,
} from "@/adapters/api-key"

export interface ApiKeyRepository {
  getById(id: string): Promise<ApiKey | null>
  listByOrganization(organizationId: string): Promise<ApiKey[]>
  listByUser(userId: string): Promise<ApiKey[]>
  create(input: CreateApiKeyInput): Promise<ApiKey>
  update(id: string, input: UpdateApiKeyInput): Promise<ApiKey>
  delete(id: string): Promise<void>
}

export class SupabaseApiKeyRepository implements ApiKeyRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<ApiKey | null> {
    const { data, error } = await this.client
      .from("api_keys")
      .select("*")
      .eq("id", id)
      .maybeSingle<ApiKeyRow>()

    if (error) throw error
    return data ? toApiKey(data) : null
  }

  async listByOrganization(organizationId: string): Promise<ApiKey[]> {
    const { data, error } = await this.client
      .from("api_keys")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .returns<ApiKeyRow[]>()

    if (error) throw error
    return data.map(toApiKey)
  }

  async listByUser(userId: string): Promise<ApiKey[]> {
    const { data, error } = await this.client
      .from("api_keys")
      .select("*, organization_members!inner(user_id)")
      .eq("organization_members.user_id", userId)
      .order("created_at", { ascending: false })
      .returns<ApiKeyRow[]>()

    if (error) throw error
    return data.map(toApiKey)
  }

  async create(input: CreateApiKeyInput): Promise<ApiKey> {
    const { data, error } = await this.client
      .from("api_keys")
      .insert(toApiKeyInsert(input))
      .select()
      .single<ApiKeyRow>()

    if (error) throw error
    return toApiKey(data)
  }

  async update(id: string, input: UpdateApiKeyInput): Promise<ApiKey> {
    const { data, error } = await this.client
      .from("api_keys")
      .update(toApiKeyUpdate(input))
      .eq("id", id)
      .select()
      .single<ApiKeyRow>()

    if (error) throw error
    return toApiKey(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("api_keys")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
