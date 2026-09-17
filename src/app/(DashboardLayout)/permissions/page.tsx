import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Lock } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabasePermissionRepository } from "@/repositories/permission.repository"
import { AdminAuthService } from "@/services/auth.service"
import { PermissionService } from "@/services/permission.service"
import type { AuthUser } from "@/types/auth"
import type { Permission } from "@/types/permission"

export const metadata: Metadata = {
  title: "Permissions",
  description: "Catalogue générique des permissions disponibles.",
}

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Catalogue générique des permissions utilisées par le contrôle d’accès.
        </p>
      </div>

      <Suspense fallback={<PermissionsLoading />}>
        <PermissionsView />
      </Suspense>
    </div>
  )
}

async function PermissionsView() {
  let user: AuthUser | null = null
  let permissions: Permission[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const permissionsService = new PermissionService(
        new SupabasePermissionRepository(supabase),
      )
      permissions = await permissionsService.list()
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
          <CardTitle>Impossible de charger les permissions</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération du catalogue des
            permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/permissions">Réessayer</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (permissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucune permission</p>
            <p className="text-sm text-muted-foreground">
              Le catalogue des permissions est vide.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Clé</TableHead>
              <TableHead className="w-[200px]">Nom</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-mono text-xs font-medium text-primary">
                  {permission.key}
                </TableCell>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {permission.description ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PermissionsLoading() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}