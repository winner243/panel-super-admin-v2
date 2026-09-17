import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"
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
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabasePermissionRepository } from "@/repositories/permission.repository"
import { SupabaseRolePermissionRepository } from "@/repositories/role-permission.repository"
import { SupabaseRoleRepository } from "@/repositories/role.repository"
import { AdminAuthService } from "@/services/auth.service"
import { PermissionService } from "@/services/permission.service"
import { RolePermissionService } from "@/services/role-permission.service"
import { RoleService } from "@/services/role.service"
import type { AuthUser } from "@/types/auth"
import type { Permission } from "@/types/permission"
import type { Role } from "@/types/role"

export const metadata: Metadata = {
  title: "Rôles",
  description: "Catalogue générique des rôles et de leurs permissions.",
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rôles</h1>
        <p className="text-sm text-muted-foreground">
          Catalogue générique des rôles et des permissions qui leur sont
          associées.
        </p>
      </div>

      <Suspense fallback={<RolesLoading />}>
        <RolesView />
      </Suspense>
    </div>
  )
}

async function RolesView() {
  let user: AuthUser | null = null
  let roles: Role[] = []
  let permissionsById = new Map<string, Permission>()
  let rolePermissionPairs: { roleId: string; permissionId: string }[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const rolesService = new RoleService(new SupabaseRoleRepository(supabase))
      const permissionsService = new PermissionService(
        new SupabasePermissionRepository(supabase),
      )
      const rolePermissionsService = new RolePermissionService(
        new SupabaseRolePermissionRepository(supabase),
      )

      ;[roles, permissionsById, rolePermissionPairs] = await Promise.all([
        rolesService.list(),
        permissionsService.list().then((items) => {
          return new Map(items.map((item) => [item.id, item]))
        }),
        rolePermissionsService.list(),
      ])
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
          <CardTitle>Impossible de charger les rôles</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération du catalogue des
            rôles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/roles">Réessayer</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <ShieldCheck className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucun rôle</p>
            <p className="text-sm text-muted-foreground">
              Le catalogue des rôles est vide.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {roles.map((role) => {
        const permissions = rolePermissionPairs
          .filter((pair) => pair.roleId === role.id)
          .map((pair) => permissionsById.get(pair.permissionId))
          .filter((permission): permission is Permission => Boolean(permission))

        return (
          <Card key={role.id} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-lightprimary text-primary">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <span className="font-mono lowercase">{role.name}</span>
                {role.isSystem ? (
                  <Badge variant="gray">Système</Badge>
                ) : (
                  <Badge variant="outlineInfo">Personnalisé</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {role.description ?? "Aucune description pour ce rôle."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Permissions ({permissions.length})
              </p>
              {permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune permission associée.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <li key={permission.id}>
                      <Badge variant="lightInfo" className="font-mono">
                        {permission.key}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function RolesLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-muted animate-pulse" />
              <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            {Array.from({ length: 3 }).map((_, chip) => (
              <div
                key={chip}
                className="inline-block h-6 w-28 rounded-full bg-muted animate-pulse"
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}