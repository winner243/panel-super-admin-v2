import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Webhook } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseWebhookRepository } from "@/repositories/webhook.repository"
import { AdminAuthService } from "@/services/auth.service"
import { WebhookService } from "@/services/webhook.service"
import type { AuthUser } from "@/types/auth"
import type { Webhook as WebhookType } from "@/types/webhook"

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Consultez et gérez les webhooks de vos organisations.",
}

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-sm text-muted-foreground">
            Supervision des webhooks provenant des systèmes connectés.
          </p>
        </div>
      </div>

      <Suspense fallback={<WebhooksLoading />}>
        <WebhooksView />
      </Suspense>
    </div>
  )
}

async function WebhooksView() {
  let user: AuthUser | null = null
  let webhooks: WebhookType[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const svc = new WebhookService(new SupabaseWebhookRepository(supabase))
      webhooks = await svc.listByUser(user.id)
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
          <CardTitle>Impossible de charger les webhooks</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération des webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/webhooks"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (webhooks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Webhook className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucun webhook</p>
            <p className="text-sm text-muted-foreground">
              Les webhooks de vos organisations apparaîtront ici.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {webhooks.map((webhook) => (
        <Card key={webhook.id} className="h-full">
          <CardContent className="space-y-1 p-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">{webhook.source}</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  webhook.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : webhook.status === "failed"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                }`}>
                {webhook.status}
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {webhook.eventType}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {webhook.endpoint}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{webhook.attempts} tentative{webhook.attempts > 1 ? "s" : ""}</span>
              <span>·</span>
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 ${
                  webhook.deliveryStatus === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : webhook.deliveryStatus === "failed"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                }`}>
                {webhook.deliveryStatus}
              </span>
            </div>
            {webhook.errorCategory && (
              <p className="text-xs text-destructive">
                Erreur : {webhook.errorCategory}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function WebhooksLoading() {
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
