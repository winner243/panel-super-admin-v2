import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Building2, Plus } from "lucide-react"
import { OrganizationCreateForm } from "@/components/organizations/organization-create-form"
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
import { SupabaseOrganizationRepository } from "@/repositories/organization.repository"
import { AdminAuthService } from "@/services/auth.service"
import { OrganizationService } from "@/services/organization.service"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import type { AuthUser } from "@/types/auth"
import type { Organization } from "@/types/organization"

export const metadata: Metadata = {
  title: "Organisations",
  description: "Liste de vos organisations et gestion de leurs membres.",
}

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organisations</h1>
          <p className="text-sm text-muted-foreground">
            Consultez et gérez les organisations auxquelles vous appartenez.
          </p>
        </div>
        <Collapsible className="w-full sm:w-auto">
          <CollapsibleTrigger asChild>
            <Button>
              <Plus className="size-4" aria-hidden="true" />
              Nouvelle organisation
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 w-full sm:w-96">
            <Card>
              <CardHeader>
                <CardTitle>Créer une organisation</CardTitle>
                <CardDescription>
                  Vous en deviendrez propriétaire. Les membres y sont ajoutés
                  depuis sa page de détails.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationCreateForm />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Suspense fallback={<OrganizationsLoading />}>
        <OrganizationsView />
      </Suspense>
    </div>
  )
}

async function OrganizationsView() {
  let user: AuthUser | null = null
  let organizations: Organization[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const orgs = new OrganizationService(new SupabaseOrganizationRepository(supabase))
      organizations = await orgs.listByUser(user.id)
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
          <CardTitle>Impossible de charger les organisations</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération de vos organisations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/organizations"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Building2 className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucune organisation</p>
            <p className="text-sm text-muted-foreground">
              Créez votre première organisation pour commencer.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {organizations.map((organization) => (
        <Link
          key={organization.id}
          href={`/organizations/${organization.id}`}
          className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-colors hover:border-primary/60">
            <CardContent className="space-y-1 p-6">
              <p className="font-medium">{organization.name}</p>
              <p className="truncate text-sm text-muted-foreground">{organization.slug}</p>
              <p className="text-xs text-muted-foreground">
                Créée le {formatDate(organization.createdAt)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function OrganizationsLoading() {
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