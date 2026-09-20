import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  AnalyticsOrganizationMetrics,
  AnalyticsPaymentMetrics,
  AnalyticsSubscriptionMetrics,
  AnalyticsUserMetrics,
} from "@/types/analytics"

export interface AnalyticsRepository {
  getUserMetrics(): Promise<AnalyticsUserMetrics>
  getOrganizationMetrics(userId: string): Promise<AnalyticsOrganizationMetrics>
  getSubscriptionMetrics(userId: string): Promise<AnalyticsSubscriptionMetrics>
  getPaymentMetrics(userId: string): Promise<AnalyticsPaymentMetrics>
}

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getUserMetrics(): Promise<AnalyticsUserMetrics> {
    const { count: totalUsers, error: totalError } = await this.client
      .from("profiles")
      .select("id", { count: "exact", head: true })

    if (totalError) throw totalError

    const uniqueUserIds = new Set<string>()
    const { data: members, error: memberError } = await this.client
      .from("organization_members")
      .select("user_id")

    if (memberError) throw memberError
    members?.forEach((m) => uniqueUserIds.add(m.user_id))

    return {
      totalUsers: totalUsers ?? 0,
      usersWithOrganizations: uniqueUserIds.size,
    }
  }

  async getOrganizationMetrics(userId: string): Promise<AnalyticsOrganizationMetrics> {
    void userId
    const { count: totalOrganizations, error: orgError } = await this.client
      .from("organizations")
      .select("id", { count: "exact", head: true })

    if (orgError) throw orgError

    const { data: members, error: memberError } = await this.client
      .from("organization_members")
      .select("organization_id")

    if (memberError) throw memberError

    const orgCount = totalOrganizations ?? 0
    const memberCount = members?.length ?? 0

    return {
      totalOrganizations: orgCount,
      averageMembersPerOrganization: orgCount > 0 ? memberCount / orgCount : 0,
    }
  }

  async getSubscriptionMetrics(userId: string): Promise<AnalyticsSubscriptionMetrics> {
    void userId
    const { data: subscriptions, error } = await this.client
      .from("subscriptions")
      .select("status")

    if (error) throw error

    const total = subscriptions?.length ?? 0
    const active = subscriptions?.filter((s) => s.status === "active").length ?? 0
    const canceled = subscriptions?.filter((s) => s.status === "canceled").length ?? 0

    return {
      totalSubscriptions: total,
      activeSubscriptions: active,
      canceledSubscriptions: canceled,
    }
  }

  async getPaymentMetrics(userId: string): Promise<AnalyticsPaymentMetrics> {
    void userId
    const { data: payments, error } = await this.client
      .from("payments")
      .select("status, amount, currency")

    if (error) throw error

    const total = payments?.length ?? 0
    const succeeded = payments?.filter((p) => p.status === "succeeded").length ?? 0
    const failed = payments?.filter((p) => p.status === "failed").length ?? 0
    const totalAmount =
      payments
        ?.filter((p) => p.status === "succeeded" && p.amount != null)
        .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0
    const currency = payments?.find((p) => p.currency)?.currency ?? "USD"

    return {
      totalPayments: total,
      succeededPayments: succeeded,
      failedPayments: failed,
      totalAmount,
      currency,
    }
  }
}
