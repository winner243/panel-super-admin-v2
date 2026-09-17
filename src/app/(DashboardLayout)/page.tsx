import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  Building2,
  LayoutDashboard,
  Lock,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseOrganizationMemberRepository } from "@/repositories/organization-member.repository"
import { SupabaseOrganizationRepository } from "@/repositories/organization.repository"
import { SupabaseRoleRepository } from "@/repositories/role.repository"
import { AdminAuthService } from "@/services/auth.service"
import { OrganizationMemberService } from "@/services/organization-member.service"
import { OrganizationService } from "@/services/organization.service"
import { RoleService } from "@/services/role.service"
import type { AuthUser } from "@/types/auth"
import type { OrganizationMember } from "@/types/organization-member"
import type { Organization } from "@/types/organization"
import type { Role } from "@/types/role"

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Vue d’ensemble administrative du panneau.",
}

const QUICK_ACCESS = [
  {
    title: "Utilisateurs",
    description: "Profil et informations personnelles.",
    href: "/users",
    icon: Users,
  },
  {
    title: "Organisations",
    description: "Organisations, membres et rôles.",
    href: "/organizations",
    icon: Building2,
  },
  {
    title: "Rôles",
    description: "Catalogue des rôles et de leurs permissions.",
    href: "/roles",
    icon: ShieldCheck,
  },
  {
    title: "Permissions",
    description: "Catalogue des permissions disponibles.",
    href: "/permissions",
    icon: Lock,
  },
  {
    title: "Paramètres",
    description: "Préférences d’affichage et du compte.",
    href: "/settings",
    icon: Settings,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardLoading />}>
        <DashboardView />
      </Suspense>
    </div>
  )
}

async function DashboardView() {
  let user: AuthUser | null = null
  let organizations: Organization[] = []
  let memberships: OrganizationMember[] = []
  let roles: Role[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const organizationsService = new OrganizationService(
        new SupabaseOrganizationRepository(supabase),
      )
      const membersService = new OrganizationMemberService(
        new SupabaseOrganizationMemberRepository(supabase),
      )
      const rolesService = new RoleService(new SupabaseRoleRepository(supabase))

      ;[organizations, memberships, roles] = await Promise.all([
        organizationsService.listByUser(user.id),
        membersService.listByUser(user.id),
        rolesService.list(),
      ])
    }
  } catch {
    failed = true
  }

  if (!user) {
    redirect("/auth/login?reason=unauthenticated")
  }

  if (failed) {
    return <DashboardError />
  }

  const displayName = user.fullName ?? user.email
  const roleNameById = new Map(roles.map((role) => [role.id, role.name]))
  const userId = user.id
  const myMemberships = memberships.filter(
    (membership) => membership.userId === userId,
  )
  const roleNames = new Set(
    myMemberships
      .map((membership) => roleNameById.get(membership.roleId))
      .filter((name): name is string => Boolean(name)),
  )
  const earliestMembership = myMemberships.reduce<string | null>((earliest, current) => {
    if (!earliest) return current.createdAt
    return current.createdAt < earliest ? current.createdAt : earliest
  }, null)

  const stats = [
    {
      label: "Organisations",
      value: organizations.length.toString(),
      hint: "mes organisations",
      href: "/organizations",
    },
    {
      label: "Adhésions",
      value: myMemberships.length.toString(),
      hint: "rôles dans mes organisations",
    },
    {
      label: "Étendue",
      value: roleNames.size.toString(),
      hint: "rôles distincts détenus",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue d’ensemble administrative de votre espace.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="h-full">
            <CardContent className="flex flex-col gap-1 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.hint}</p>
              {stat.href ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-fit px-0 text-primary hover:bg-transparent hover:text-primary">
                  <Link href={stat.href}>
                    Voir
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="size-5 text-primary" aria-hidden="true" />
              Mes organisations
            </CardTitle>
            <CardDescription>
              Les organisations auxquelles vous appartenez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
                <Building2 className="size-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Aucune organisation pour le moment.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/organizations">Créer une organisation</Link>
                </Button>
              </div>
            ) : (
              <ul>
                {organizations.slice(0, 5).map((organization, index) => {
                  const membership = myMemberships.find(
                    (item) => item.organizationId === organization.id,
                  )
                  const roleName = membership
                    ? roleNameById.get(membership.roleId)
                    : undefined
                  const href = `/organizations/${organization.id}`

                  return (
                    <li key={organization.id}>
                      {index > 0 ? <Separator className="my-4" /> : null}
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            <Link
                              href={href}
                              className="focus-visible:underline focus-visible:outline-none hover:underline">
                              {organization.name}
                            </Link>
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {organization.slug}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {roleName ? (
                            <Badge variant="lightPrimary" className="font-mono lowercase">
                              {roleName}
                            </Badge>
                          ) : null}
                          <Button asChild variant="ghost" size="icon" aria-label={`Ouvrir ${organization.name}`}>
                            <Link href={href}>
                              <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCog className="size-5 text-primary" aria-hidden="true" />
                Contexte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Rôles détenus</p>
                {roleNames.size === 0 ? (
                  <p className="text-muted-foreground">Aucun rôle attribué.</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {Array.from(roleNames).map((name) => (
                      <li key={name}>
                        <Badge variant="lightInfo" className="font-mono lowercase">
                          {name}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {earliestMembership ? (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium">Membre depuis</p>
                    <p className="text-muted-foreground">
                      {formatDate(earliestMembership)}
                    </p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <LayoutDashboard className="size-5 text-primary" aria-hidden="true" />
                Accès rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK_ACCESS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-lightprimary text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{item.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DashboardError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impossible de charger le tableau de bord</CardTitle>
        <CardDescription>
          Une erreur est survenue lors de la récupération de vos informations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Réessayer</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded bg-muted animate-pulse" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              <div className="h-8 w-12 rounded bg-muted animate-pulse" />
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 rounded-md bg-muted animate-pulse" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(iso))
}