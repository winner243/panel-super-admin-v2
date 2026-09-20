import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CreditCard } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseSubscriptionRepository } from "@/repositories/subscription.repository"
import { AdminAuthService } from "@/services/auth.service"
import { SubscriptionService } from "@/services/subscription.service"
import type { AuthUser } from "@/types/auth"
import type { Subscription } from "@/types/subscription"

export const metadata: Metadata = {
  title: "Abonnements",
  description: "Consultez et gérez les abonnements de vos organisations.",
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Abonnements</h1>
          <p className="text-sm text-muted-foreground">
            Liste des abonnements actifs et historiques de vos organisations.
          </p>
        </div>
      </div>

      <Suspense fallback={<SubscriptionsLoading />}>
        <SubscriptionsView />
      </Suspense>
    </div>
  )
}

async function SubscriptionsView() {
  let user: AuthUser | null = null
  let subscriptions: Subscription[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const subs = new SubscriptionService(new SupabaseSubscriptionRepository(supabase))
      subscriptions = await subs.listByUser(user.id)
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
          <CardTitle>Impossible de charger les abonnements</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération des abonnements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/subscriptions"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CreditCard className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucun abonnement</p>
            <p className="text-sm text-muted-foreground">
              Les abonnements de vos organisations apparaîtront ici.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} className="h-full">
          <CardContent className="space-y-1 p-6">
            <p className="font-medium">{subscription.planId}</p>
            <p className="truncate text-sm text-muted-foreground">
              {subscription.status}
            </p>
            <p className="text-xs text-muted-foreground">
              Début : {formatDate(subscription.startDate)}
            </p>
            {subscription.renewalDate && (
              <p className="text-xs text-muted-foreground">
                Renouvellement : {formatDate(subscription.renewalDate)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SubscriptionsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-2 p-6">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(iso))
}