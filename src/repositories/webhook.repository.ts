import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  Webhook,
} from "@/types/webhook"
import {
  toWebhook,
  toWebhookInsert,
  toWebhookUpdate,
  type WebhookRow,
} from "@/adapters/webhook"

export interface WebhookRepository {
  getById(id: string): Promise<Webhook | null>
  listByOrganization(organizationId: string): Promise<Webhook[]>
  listByUser(userId: string): Promise<Webhook[]>
  create(input: CreateWebhookInput): Promise<Webhook>
  update(id: string, input: UpdateWebhookInput): Promise<Webhook>
  delete(id: string): Promise<void>
}

export class SupabaseWebhookRepository implements WebhookRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<Webhook | null> {
    const { data, error } = await this.client
      .from("webhooks")
      .select("*")
      .eq("id", id)
      .maybeSingle<WebhookRow>()

    if (error) throw error
    return data ? toWebhook(data) : null
  }

  async listByOrganization(organizationId: string): Promise<Webhook[]> {
    const { data, error } = await this.client
      .from("webhooks")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .returns<WebhookRow[]>()

    if (error) throw error
    return data.map(toWebhook)
  }

  async listByUser(userId: string): Promise<Webhook[]> {
    const { data, error } = await this.client
      .from("webhooks")
      .select("*, organization_members!inner(user_id)")
      .eq("organization_members.user_id", userId)
      .order("created_at", { ascending: false })
      .returns<WebhookRow[]>()

    if (error) throw error
    return data.map(toWebhook)
  }

  async create(input: CreateWebhookInput): Promise<Webhook> {
    const { data, error } = await this.client
      .from("webhooks")
      .insert(toWebhookInsert(input))
      .select()
      .single<WebhookRow>()

    if (error) throw error
    return toWebhook(data)
  }

  async update(id: string, input: UpdateWebhookInput): Promise<Webhook> {
    const { data, error } = await this.client
      .from("webhooks")
      .update(toWebhookUpdate(input))
      .eq("id", id)
      .select()
      .single<WebhookRow>()

    if (error) throw error
    return toWebhook(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("webhooks")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
