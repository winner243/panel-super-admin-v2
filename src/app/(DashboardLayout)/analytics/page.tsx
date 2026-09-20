import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseAnalyticsRepository } from "@/repositories/analytics.repository"
import { AdminAuthService } from "@/services/auth.service"
import { AnalyticsService } from "@/services/analytics.service"
import type { AuthUser } from "@/types/auth"
import type {
  AnalyticsOrganizationMetrics,
  AnalyticsPaymentMetrics,
  AnalyticsSubscriptionMetrics,
  AnalyticsUserMetrics,
} from "@/types/analytics"

export const metadata: Metadata = {
  title: "Analytics",
  description: "Metriques agregees de votre plateforme.",
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Metriques agregees provenant des systemes connectes.
          </p>
        </div>
      </div>

      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsView />
      </Suspense>
    </div>
  )
}

async function AnalyticsView() {
  let user: AuthUser | null = null
  let userMetrics: AnalyticsUserMetrics | null = null
  let orgMetrics: AnalyticsOrganizationMetrics | null = null
  let subMetrics: AnalyticsSubscriptionMetrics | null = null
  let payMetrics: AnalyticsPaymentMetrics | null = null
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const svc = new AnalyticsService(new SupabaseAnalyticsRepository(supabase))
      const results = await Promise.all([
        svc.getUserMetrics(),
        svc.getOrganizationMetrics(user.id),
        svc.getSubscriptionMetrics(user.id),
        svc.getPaymentMetrics(user.id),
      ])
      userMetrics = results[0]
      orgMetrics = results[1]
      subMetrics = results[2]
      payMetrics = results[3]
    }
  } catch {
    failed = true
  }

  if (!user) {
    redirect("/auth/login?reason=unauthenticated")
  }

  if (failed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impossible de charger les analytics</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la recuperation des metriques.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/analytics"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Reessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Utilisateurs"
          value={userMetrics?.totalUsers ?? 0}
          description={`${userMetrics?.usersWithOrganizations ?? 0} dans au moins une organisation`}
        />
        <MetricCard
          title="Organisations"
          value={orgMetrics?.totalOrganizations ?? 0}
          description={`Moy. ${(orgMetrics?.averageMembersPerOrganization ?? 0).toFixed(1)} membres/org`}
        />
        <MetricCard
          title="Abonnements actifs"
          value={subMetrics?.activeSubscriptions ?? 0}
          description={`${subMetrics?.totalSubscriptions ?? 0} total, ${subMetrics?.canceledSubscriptions ?? 0} annules`}
        />
        <MetricCard
          title="Paiements reussis"
          value={payMetrics?.succeededPayments ?? 0}
          description={
            payMetrics?.totalAmount
              ? `${payMetrics.totalAmount.toFixed(2)} ${payMetrics.currency}`
              : "Aucun montant"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Resume</CardTitle>
          <CardDescription>
            Vue d ensemble des metriques principales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les metriques ci-dessus sont calculees a partir des donnees reelles
            disponibles dans les systemes connectes. Aucune donnee fictive nest
            utilisee.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string
  value: number
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function AnalyticsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-2 p-6">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-8 w-24 rounded bg-muted animate-pulse" />
            <div className="h-3 w-40 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
