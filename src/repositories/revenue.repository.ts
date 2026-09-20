import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  RevenueByOrganization,
  RevenueByPeriod,
  RevenueBreakdown,
  RevenuePeriod,
} from "@/types/revenue"

export interface RevenueRepository {
  getBreakdown(userId: string, period: RevenuePeriod): Promise<RevenueBreakdown>
}

export class SupabaseRevenueRepository implements RevenueRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getBreakdown(userId: string, period: RevenuePeriod): Promise<RevenueBreakdown> {
    const { data: payments, error } = await this.client
      .from("payments")
      .select("*, organization_members!inner(user_id), organizations!inner(id, name)")
      .eq("organization_members.user_id", userId)
      .eq("status", "succeeded")
      .gte("created_at", period.start)
      .lte("created_at", period.end)
      .order("created_at", { ascending: false })

    if (error) throw error

    const totalRevenue = payments.reduce(
      (sum, p) => sum + (p.amount != null ? Number(p.amount) : 0),
      0,
    )
    const paymentCount = payments.length
    const currency = payments.length > 0 ? payments[0].currency : "USD"
    const averagePaymentAmount = paymentCount > 0 ? totalRevenue / paymentCount : 0

    const byOrganizationMap = new Map<
      string,
      { name: string | null; totalRevenue: number; paymentCount: number }
    >()
    for (const p of payments) {
      const orgId = p.organization_id
      const existing = byOrganizationMap.get(orgId) ?? {
        name: null,
        totalRevenue: 0,
        paymentCount: 0,
      }
      const orgs = p.organizations as { id: string; name: string | null } | null
      existing.name = orgs?.name ?? existing.name
      existing.totalRevenue += p.amount != null ? Number(p.amount) : 0
      existing.paymentCount += 1
      byOrganizationMap.set(orgId, existing)
    }

    const byOrganization: RevenueByOrganization[] = Array.from(byOrganizationMap.entries())
      .map(([organizationId, data]) => ({
        organizationId,
        organizationName: data.name,
        totalRevenue: data.totalRevenue,
        paymentCount: data.paymentCount,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    const byPeriodMap = new Map<string, { totalRevenue: number; paymentCount: number }>()
    for (const p of payments) {
      const month = p.created_at.substring(0, 7)
      const existing = byPeriodMap.get(month) ?? { totalRevenue: 0, paymentCount: 0 }
      existing.totalRevenue += p.amount != null ? Number(p.amount) : 0
      existing.paymentCount += 1
      byPeriodMap.set(month, existing)
    }

    const byPeriod: RevenueByPeriod[] = Array.from(byPeriodMap.entries())
      .map(([periodStr, data]) => ({
        period: periodStr,
        totalRevenue: data.totalRevenue,
        paymentCount: data.paymentCount,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))

    return {
      summary: {
        totalRevenue,
        currency,
        period,
        paymentCount,
        averagePaymentAmount,
      },
      byOrganization,
      byPeriod,
    }
  }
}
