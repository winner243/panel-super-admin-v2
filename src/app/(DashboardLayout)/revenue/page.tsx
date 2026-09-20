import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BadgeDollarSign } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseRevenueRepository } from "@/repositories/revenue.repository"
import { AdminAuthService } from "@/services/auth.service"
import { RevenueService } from "@/services/revenue.service"
import type { AuthUser } from "@/types/auth"
import type { RevenueBreakdown } from "@/types/revenue"

export const metadata: Metadata = {
  title: "Revenus",
  description: "Agrégation des revenus issus des paiements confirmés.",
}

function getDefaultPeriod() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const end = now.toISOString()
  return { start, end }
}

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Revenus</h1>
          <p className="text-sm text-muted-foreground">
            Agrégation des revenus issus des paiements confirmés du mois en cours.
          </p>
        </div>
      </div>

      <Suspense fallback={<RevenueLoading />}>
        <RevenueView />
      </Suspense>
    </div>
  )
}

async function RevenueView() {
  let user: AuthUser | null = null
  let breakdown: RevenueBreakdown | null = null
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const svc = new RevenueService(new SupabaseRevenueRepository(supabase))
      breakdown = await svc.getBreakdown(user.id, getDefaultPeriod())
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
          <CardTitle>Impossible de charger les revenus</CardTitle>
          <CardDescription>
            Une erreur est survenue lors du calcul des revenus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/revenue"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (!breakdown || breakdown.summary.paymentCount === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <BadgeDollarSign className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucun revenu pour cette période</p>
            <p className="text-sm text-muted-foreground">
              Les revenus seront calculés à partir des paiements confirmés.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { summary, byOrganization, byPeriod } = breakdown

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.totalRevenue.toFixed(2)} {summary.currency}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.paymentCount} paiement{summary.paymentCount > 1 ? "s" : ""} confirmé{summary.paymentCount > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.averagePaymentAmount.toFixed(2)} {summary.currency}
            </p>
            <p className="text-xs text-muted-foreground">par paiement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Organisations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byOrganization.length}</p>
            <p className="text-xs text-muted-foreground">avec paiements</p>
          </CardContent>
        </Card>
      </div>

      {byOrganization.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle as="h2">Revenus par organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byOrganization.map((org) => (
                <div
                  key={org.organizationId}
                  className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{org.organizationName ?? org.organizationId}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.paymentCount} paiement{org.paymentCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="font-medium">
                    {org.totalRevenue.toFixed(2)} {summary.currency}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {byPeriod.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle as="h2">Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byPeriod.map((period) => (
                <div
                  key={period.period}
                  className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{period.period}</p>
                    <p className="text-xs text-muted-foreground">
                      {period.paymentCount} paiement{period.paymentCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="font-medium">
                    {period.totalRevenue.toFixed(2)} {summary.currency}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function RevenueLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-2 p-6">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-8 w-24 rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 rounded-md bg-muted animate-pulse" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
