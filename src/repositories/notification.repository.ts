import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateNotificationInput,
  Notification,
  UpdateNotificationInput,
} from "@/types/notification"
import {
  toNotification,
  toNotificationInsert,
  toNotificationUpdate,
  type NotificationRow,
} from "@/adapters/notification"

export interface NotificationRepository {
  getById(id: string): Promise<Notification | null>
  listByRecipient(recipientId: string): Promise<Notification[]>
  listByOrganization(organizationId: string): Promise<Notification[]>
  create(input: CreateNotificationInput): Promise<Notification>
  update(id: string, input: UpdateNotificationInput): Promise<Notification>
  delete(id: string): Promise<void>
  markAsRead(id: string): Promise<Notification>
  markAllAsRead(recipientId: string): Promise<void>
}

export class SupabaseNotificationRepository implements NotificationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<Notification | null> {
    const { data, error } = await this.client
      .from("notifications")
      .select("*")
      .eq("id", id)
      .maybeSingle<NotificationRow>()

    if (error) throw error
    return data ? toNotification(data) : null
  }

  async listByRecipient(recipientId: string): Promise<Notification[]> {
    const { data, error } = await this.client
      .from("notifications")
      .select("*")
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false })
      .returns<NotificationRow[]>()

    if (error) throw error
    return data.map(toNotification)
  }

  async listByOrganization(organizationId: string): Promise<Notification[]> {
    const { data, error } = await this.client
      .from("notifications")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .returns<NotificationRow[]>()

    if (error) throw error
    return data.map(toNotification)
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const { data, error } = await this.client
      .from("notifications")
      .insert(toNotificationInsert(input))
      .select()
      .single<NotificationRow>()

    if (error) throw error
    return toNotification(data)
  }

  async update(id: string, input: UpdateNotificationInput): Promise<Notification> {
    const { data, error } = await this.client
      .from("notifications")
      .update(toNotificationUpdate(input))
      .eq("id", id)
      .select()
      .single<NotificationRow>()

    if (error) throw error
    return toNotification(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("notifications")
      .delete()
      .eq("id", id)

    if (error) throw error
  }

  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await this.client
      .from("notifications")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single<NotificationRow>()

    if (error) throw error
    return toNotification(data)
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    const { error } = await this.client
      .from("notifications")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("recipient_id", recipientId)
      .eq("status", "unread")

    if (error) throw error
  }
}
