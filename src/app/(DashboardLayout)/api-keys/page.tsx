import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Key } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseApiKeyRepository } from "@/repositories/api-key.repository"
import { AdminAuthService } from "@/services/auth.service"
import { ApiKeyService } from "@/services/api-key.service"
import type { AuthUser } from "@/types/auth"
import type { ApiKey } from "@/types/api-key"

export const metadata: Metadata = {
  title: "Clés API",
  description: "Consultez et gérez les clés API de vos organisations.",
}

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clés API</h1>
          <p className="text-sm text-muted-foreground">
            Gestion des clés API pour les intégrations SaaS.
          </p>
        </div>
      </div>

      <Suspense fallback={<ApiKeysLoading />}>
        <ApiKeysView />
      </Suspense>
    </div>
  )
}

async function ApiKeysView() {
  let user: AuthUser | null = null
  let apiKeys: ApiKey[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const svc = new ApiKeyService(new SupabaseApiKeyRepository(supabase))
      apiKeys = await svc.listByUser(user.id)
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
          <CardTitle>Impossible de charger les clés API</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération des clés API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/api-keys"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (apiKeys.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Key className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucune clé API</p>
            <p className="text-sm text-muted-foreground">
              Les clés API de vos organisations apparaîtront ici.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {apiKeys.map((apiKey) => (
        <Card key={apiKey.id} className="h-full">
          <CardContent className="space-y-1 p-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">{apiKey.name}</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  apiKey.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : apiKey.status === "revoked"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                }`}>
                {apiKey.status}
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {apiKey.environment} · {apiKey.scopes.length} portée{apiKey.scopes.length > 1 ? "s" : ""}
            </p>
            {apiKey.keyPrefix && (
              <p className="truncate text-xs font-mono text-muted-foreground">
                {apiKey.keyPrefix}••••••••
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {apiKey.lastUsedAt ? (
                <span>Dernière utilisation le {new Date(apiKey.lastUsedAt).toLocaleDateString("fr-FR")}</span>
              ) : (
                <span>Jamais utilisé</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ApiKeysLoading() {
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
