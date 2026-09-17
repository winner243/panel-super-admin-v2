import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { z } from "zod"
import { ArrowLeft, Building2 } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { MembersManager } from "@/components/organizations/members-manager"
import { OrganizationUpdateForm } from "@/components/organizations/organization-update-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseOrganizationMemberRepository } from "@/repositories/organization-member.repository"
import { SupabaseOrganizationRepository } from "@/repositories/organization.repository"
import { SupabaseRoleRepository } from "@/repositories/role.repository"
import { AdminAuthService } from "@/services/auth.service"
import { OrganizationMemberService } from "@/services/organization-member.service"
import { OrganizationService } from "@/services/organization.service"
import type { AuthUser } from "@/types/auth"
import type { Organization } from "@/types/organization"
import type { OrganizationMemberWithDetails } from "@/types/organization-member"
import type { Role } from "@/types/role"

export const metadata: Metadata = {
  title: "Organisation",
  description: "Détail d'une organisation et gestion de ses membres.",
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  if (!z.uuid().safeParse(orgId).success) notFound()

  return (
    <Suspense fallback={<OrganizationDetailLoading />}>
      <OrganizationDetail orgId={orgId} />
    </Suspense>
  )
}

async function OrganizationDetail({ orgId }: { orgId: string }) {
  let user: AuthUser | null = null
  let organization: Organization | null = null
  let members: OrganizationMemberWithDetails[] = []
  let roles: Role[] = []
  let canUpdate = false
  let canManageMembers = false
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const organizations = new OrganizationService(
        new SupabaseOrganizationRepository(supabase),
      )
      const membersService = new OrganizationMemberService(
        new SupabaseOrganizationMemberRepository(supabase),
      )

      organization = await organizations.getById(orgId)

      if (organization) {
        ;[members, roles, canUpdate, canManageMembers] = await Promise.all([
          membersService.listByOrganizationWithDetails(orgId),
          new SupabaseRoleRepository(supabase).list(),
          membersService.hasPermission(orgId, "organizations.update"),
          membersService.hasPermission(orgId, "organizations.members.manage"),
        ])
      }
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
          <CardTitle>Impossible de charger l’organisation</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération des informations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/organizations">Retour aux organisations</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!organization) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ms-3 mb-2">
          <Link href="/organizations">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Toutes les organisations
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{organization.name}</h1>
        <p className="text-sm text-muted-foreground">
          {organization.slug} · Créée le {formatDate(organization.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="flex items-center gap-3">
                <Building2 className="size-5 text-primary" aria-hidden="true" />
                Membres ({members.length})
              </CardTitle>
              <CardDescription>
                {canManageMembers
                  ? "Gérez les rôles et le retrait des membres."
                  : "Liste en lecture seule des membres de l’organisation."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun membre.</p>
              ) : (
                <MembersManager
                  organizationId={orgId}
                  members={members}
                  roles={roles}
                  canManage={canManageMembers}
                  currentUserId={user.id}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{organization.name}</p>
              <p className="text-muted-foreground">{organization.slug}</p>
              <p className="text-muted-foreground">
                Créée le {formatDate(organization.createdAt)}
              </p>
            </CardContent>
          </Card>

          {canUpdate ? (
            <Card>
              <CardHeader>
                <CardTitle>Modifier l’organisation</CardTitle>
                <CardDescription>
                  Le changement de slug peut invalider les liens existants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationUpdateForm
                  organizationId={orgId}
                  initialName={organization.name}
                  initialSlug={organization.slug}
                />
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vous n’avez pas la permission de modifier cette organisation.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function OrganizationDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded bg-muted animate-pulse" />
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 rounded-md bg-muted animate-pulse" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-9 rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(iso))
}