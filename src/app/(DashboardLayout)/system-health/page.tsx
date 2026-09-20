import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SystemHealthService } from "@/services/system-health.service"
import { AdminAuthService } from "@/services/auth.service"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SystemHealthSnapshot } from "@/types/system-health"

export const metadata: Metadata = {
  title: "Santé du système",
  description: "État de santé des composants du système.",
}

export default function SystemHealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Santé du système</h1>
          <p className="text-sm text-muted-foreground">
            État de santé en temps réel des composants critiques.
          </p>
        </div>
      </div>

      <Suspense fallback={<SystemHealthLoading />}>
        <SystemHealthView />
      </Suspense>
    </div>
  )
}

async function SystemHealthView() {
  let snapshot: SystemHealthSnapshot | null = null
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    const user = await auth.getUser()

    if (!user) {
      redirect("/auth/login?reason=unauthenticated")
    }

    const svc = new SystemHealthService(supabase)
    snapshot = await svc.getSnapshot()
  } catch {
    failed = true
  }

  if (!snapshot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impossible de charger la santé du système</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la vérification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/system-health"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Statut global</p>
            <p className="mt-1 text-2xl font-semibold">
              <span
                className={
                  snapshot.status === "healthy"
                    ? "text-green-600 dark:text-green-400"
                    : snapshot.status === "degraded"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }>
                {snapshot.status === "healthy"
                  ? "Opérationnel"
                  : snapshot.status === "degraded"
                    ? "Dégradé"
                    : "Indisponible"}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Version</p>
            <p className="mt-1 text-2xl font-semibold">{snapshot.version}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Composants</p>
            <p className="mt-1 text-2xl font-semibold">{snapshot.components.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Vérifié le</p>
            <p className="mt-1 text-sm font-semibold">
              {new Date(snapshot.checkedAt).toLocaleString("fr-FR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.components.map((component) => (
          <Card key={component.id} className="h-full">
            <CardContent className="space-y-1 p-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">{component.name}</p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    component.status === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : component.status === "degraded"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}>
                  {component.status}
                </span>
              </div>
              {component.latencyMs !== null && (
                <p className="text-sm text-muted-foreground">
                  Latence : {component.latencyMs}ms
                </p>
              )}
              {component.message && (
                <p className="text-xs text-muted-foreground">{component.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Vérifié le {new Date(component.lastCheckedAt).toLocaleString("fr-FR")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SystemHealthLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="mt-2 h-8 w-16 rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
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
    </div>
  )
}
