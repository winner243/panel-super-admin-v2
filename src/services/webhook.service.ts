import type { WebhookRepository } from "@/repositories/webhook.repository"
import type { Webhook } from "@/types/webhook"
import { parseCreateWebhook, parseUpdateWebhook } from "@/validators/webhook"

export class WebhookService {
  constructor(private readonly webhooks: WebhookRepository) {}

  async getById(id: string): Promise<Webhook | null> {
    return this.webhooks.getById(id)
  }

  async listByOrganization(organizationId: string): Promise<Webhook[]> {
    return this.webhooks.listByOrganization(organizationId)
  }

  async listByUser(userId: string): Promise<Webhook[]> {
    return this.webhooks.listByUser(userId)
  }

  async create(input: unknown): Promise<Webhook> {
    const parsed = parseCreateWebhook(input)
    return this.webhooks.create(parsed)
  }

  async update(id: string, input: unknown): Promise<Webhook> {
    const parsed = parseUpdateWebhook(input)
    return this.webhooks.update(id, parsed)
  }

  async delete(id: string): Promise<void> {
    return this.webhooks.delete(id)
  }
}
