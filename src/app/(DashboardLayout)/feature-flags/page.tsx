import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Flag, Plus } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseFeatureFlagRepository } from "@/repositories/feature-flag.repository"
import { AdminAuthService } from "@/services/auth.service"
import { FeatureFlagService } from "@/services/feature-flag.service"
import type { AuthUser } from "@/types/auth"
import type { FeatureFlag } from "@/types/feature-flag"
import { FeatureFlagCreateForm } from "@/components/feature-flags/feature-flag-create-form"
import { FeatureFlagToggle } from "@/components/feature-flags/feature-flag-toggle"

export const metadata: Metadata = {
  title: "Feature Flags",
  description: "Gerez les feature flags de vos SaaS connectes.",
}

export default function FeatureFlagsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Feature Flags</h1>
          <p className="text-sm text-muted-foreground">
            Gerez les feature flags pouvant etre consommes par les SaaS connectes.
          </p>
        </div>
        <Collapsible className="w-full sm:w-auto">
          <CollapsibleTrigger asChild>
            <Button>
              <Plus className="size-4" aria-hidden="true" />
              Nouveau flag
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 w-full sm:w-96">
            <Card>
              <CardHeader>
                <CardTitle>Creer un feature flag</CardTitle>
                <CardDescription>
                  Definissez une cle unique et un nom pour ce flag.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagCreateForm />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Suspense fallback={<FeatureFlagsLoading />}>
        <FeatureFlagsView />
      </Suspense>
    </div>
  )
}

async function FeatureFlagsView() {
  let user: AuthUser | null = null
  let flags: FeatureFlag[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const svc = new FeatureFlagService(new SupabaseFeatureFlagRepository(supabase))
      flags = await svc.list()
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
          <CardTitle>Impossible de charger les feature flags</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la recuperation des feature flags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/feature-flags"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Reessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (flags.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Flag className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucun feature flag</p>
            <p className="text-sm text-muted-foreground">
              Creez votre premier feature flag pour commencer.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {flags.map((flag) => (
        <Card key={flag.id}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{flag.name}</p>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-mono">
                  {flag.key}
                </span>
                <span className="text-xs text-muted-foreground">({flag.scope})</span>
              </div>
              {flag.description && (
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              )}
            </div>
            <FeatureFlagToggle flagId={flag.id} initialEnabled={flag.enabled} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FeatureFlagsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-2 p-6">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
