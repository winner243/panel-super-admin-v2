import type { AnalyticsRepository } from "@/repositories/analytics.repository"
import type {
  AnalyticsOrganizationMetrics,
  AnalyticsPaymentMetrics,
  AnalyticsSubscriptionMetrics,
  AnalyticsUserMetrics,
} from "@/types/analytics"

export class AnalyticsService {
  constructor(private readonly analytics: AnalyticsRepository) {}

  async getUserMetrics(): Promise<AnalyticsUserMetrics> {
    return this.analytics.getUserMetrics()
  }

  async getOrganizationMetrics(userId: string): Promise<AnalyticsOrganizationMetrics> {
    return this.analytics.getOrganizationMetrics(userId)
  }

  async getSubscriptionMetrics(userId: string): Promise<AnalyticsSubscriptionMetrics> {
    return this.analytics.getSubscriptionMetrics(userId)
  }

  async getPaymentMetrics(userId: string): Promise<AnalyticsPaymentMetrics> {
    return this.analytics.getPaymentMetrics(userId)
  }
}
