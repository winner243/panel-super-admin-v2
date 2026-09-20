import type { RevenueRepository } from "@/repositories/revenue.repository"
import type { RevenueBreakdown, RevenuePeriod } from "@/types/revenue"

export class RevenueService {
  constructor(private readonly revenue: RevenueRepository) {}

  async getBreakdown(userId: string, period: RevenuePeriod): Promise<RevenueBreakdown> {
    return this.revenue.getBreakdown(userId, period)
  }
}
