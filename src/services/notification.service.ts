import type { NotificationRepository } from "@/repositories/notification.repository"
import type { Notification } from "@/types/notification"
import { parseCreateNotification, parseUpdateNotification } from "@/validators/notification"

export class NotificationService {
  constructor(private readonly notifications: NotificationRepository) {}

  async getById(id: string): Promise<Notification | null> {
    return this.notifications.getById(id)
  }

  async listByRecipient(recipientId: string): Promise<Notification[]> {
    return this.notifications.listByRecipient(recipientId)
  }

  async listByOrganization(organizationId: string): Promise<Notification[]> {
    return this.notifications.listByOrganization(organizationId)
  }

  async create(input: unknown): Promise<Notification> {
    const parsed = parseCreateNotification(input)
    return this.notifications.create(parsed)
  }

  async update(id: string, input: unknown): Promise<Notification> {
    const parsed = parseUpdateNotification(input)
    return this.notifications.update(id, parsed)
  }

  async delete(id: string): Promise<void> {
    return this.notifications.delete(id)
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.notifications.markAsRead(id)
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    return this.notifications.markAllAsRead(recipientId)
  }
}
