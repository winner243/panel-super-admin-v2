import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from "@/types/subscription"
import {
  toSubscription,
  toSubscriptionInsert,
  toSubscriptionUpdate,
  type SubscriptionRow,
} from "@/adapters/subscription"

export interface SubscriptionRepository {
  getById(id: string): Promise<Subscription | null>
  listByOrganization(organizationId: string): Promise<Subscription[]>
  listByUser(userId: string): Promise<Subscription[]>
  create(input: CreateSubscriptionInput): Promise<Subscription>
  update(id: string, input: UpdateSubscriptionInput): Promise<Subscription>
  delete(id: string): Promise<void>
}

export class SupabaseSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<Subscription | null> {
    const { data, error } = await this.client
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .maybeSingle<SubscriptionRow>()

    if (error) throw error
    return data ? toSubscription(data) : null
  }

  async listByOrganization(organizationId: string): Promise<Subscription[]> {
    const { data, error } = await this.client
      .from("subscriptions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .returns<SubscriptionRow[]>()

    if (error) throw error
    return data.map(toSubscription)
  }

  async listByUser(userId: string): Promise<Subscription[]> {
    const { data, error } = await this.client
      .from("subscriptions")
      .select("*, organization_members!inner(user_id), organizations!inner(name)")
      .eq("organization_members.user_id", userId)
      .order("created_at", { ascending: false })
      .returns<SubscriptionRow[]>()

    if (error) throw error
    return data.map(toSubscription)
  }

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const { data, error } = await this.client
      .from("subscriptions")
      .insert(toSubscriptionInsert(input))
      .select()
      .single<SubscriptionRow>()

    if (error) throw error
    return toSubscription(data)
  }

  async update(id: string, input: UpdateSubscriptionInput): Promise<Subscription> {
    const { data, error } = await this.client
      .from("subscriptions")
      .update(toSubscriptionUpdate(input))
      .eq("id", id)
      .select()
      .single<SubscriptionRow>()

    if (error) throw error
    return toSubscription(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("subscriptions")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}