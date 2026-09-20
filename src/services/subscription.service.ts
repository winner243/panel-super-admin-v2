import type { SubscriptionRepository } from "@/repositories/subscription.repository"
import type { Subscription } from "@/types/subscription"
import { parseCreateSubscription, parseUpdateSubscription } from "@/validators/subscription"

export class SubscriptionService {
  constructor(private readonly subscriptions: SubscriptionRepository) {}

  async getById(id: string): Promise<Subscription | null> {
    return this.subscriptions.getById(id)
  }

  async listByOrganization(organizationId: string): Promise<Subscription[]> {
    return this.subscriptions.listByOrganization(organizationId)
  }

  async listByUser(userId: string): Promise<Subscription[]> {
    return this.subscriptions.listByUser(userId)
  }

  async create(input: unknown): Promise<Subscription> {
    const parsed = parseCreateSubscription(input)
    return this.subscriptions.create(parsed)
  }

  async update(id: string, input: unknown): Promise<Subscription> {
    const parsed = parseUpdateSubscription(input)
    return this.subscriptions.update(id, parsed)
  }

  async delete(id: string): Promise<void> {
    return this.subscriptions.delete(id)
  }
}