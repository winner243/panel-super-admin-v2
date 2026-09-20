export interface AnalyticsMetric {
  label: string
  value: number
  change?: number
  changePercentage?: number
}

export interface AnalyticsTimeSeriesPoint {
  date: string
  value: number
}

export interface AnalyticsCategory {
  name: string
  metrics: AnalyticsMetric[]
}

export interface AnalyticsOverview {
  generatedAt: string
  categories: AnalyticsCategory[]
}

export interface AnalyticsUserMetrics {
  totalUsers: number
  usersWithOrganizations: number
}

export interface AnalyticsOrganizationMetrics {
  totalOrganizations: number
  averageMembersPerOrganization: number
}

export interface AnalyticsSubscriptionMetrics {
  totalSubscriptions: number
  activeSubscriptions: number
  canceledSubscriptions: number
}

export interface AnalyticsPaymentMetrics {
  totalPayments: number
  succeededPayments: number
  failedPayments: number
  totalAmount: number
  currency: string
}
