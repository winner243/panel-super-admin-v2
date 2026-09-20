export interface RevenuePeriod {
  start: string
  end: string
}

export interface RevenueSummary {
  totalRevenue: number
  currency: string
  period: RevenuePeriod
  paymentCount: number
  averagePaymentAmount: number
}

export interface RevenueByOrganization {
  organizationId: string
  organizationName: string | null
  totalRevenue: number
  paymentCount: number
}

export interface RevenueByPeriod {
  period: string
  totalRevenue: number
  paymentCount: number
}

export interface RevenueBreakdown {
  summary: RevenueSummary
  byOrganization: RevenueByOrganization[]
  byPeriod: RevenueByPeriod[]
}
