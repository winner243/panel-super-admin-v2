import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ScrollText } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { AuditLogFilters } from "@/components/audit/audit-log-filters"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { SupabaseOrganizationRepository } from "@/repositories/organization.repository"
import { SupabaseAuditLogRepository } from "@/repositories/audit-log.repository"
import { AdminAuthService } from "@/services/auth.service"
import { AuditLogService } from "@/services/audit-log.service"
import { OrganizationService } from "@/services/organization.service"
import { AUDIT_ACTIONS } from "@/types/audit-log"
import type { AuthUser } from "@/types/auth"
import type { AuditLogWithActor } from "@/types/audit-log"

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Journal des événements administratifs du panneau.",
}

const PAGE_SIZE = 25

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; action?: string; page?: string }>
}) {
  const sp = await searchParams
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Journal des événements administratifs du panneau.
        </p>
      </div>
      <Suspense fallback={<AuditLogsLoading />}>
        <AuditLogsView orgParam={sp.org} actionParam={sp.action} pageParam={sp.page} />
      </Suspense>
    </div>
  )
}

async function AuditLogsView({
  orgParam,
  actionParam,
  pageParam,
}: {
  orgParam?: string
  actionParam?: string
  pageParam?: string
}) {
  let user: AuthUser | null = null
  let orgs: { id: string; name: string }[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const orgService = new OrganizationService(new SupabaseOrganizationRepository(supabase))
      const allOrgs = await orgService.listByUser(user.id)
      orgs = allOrgs.map((o) => ({ id: o.id, name: o.name }))
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
          <CardTitle>Impossible de charger les logs</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération de vos données.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/audit">Réessayer</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const validActionValues = AUDIT_ACTIONS.map((a) => a.value)
  const orgValue =
    orgParam && (orgParam === "me" || orgs.some((o) => o.id === orgParam))
      ? orgParam
      : (orgs[0]?.id ?? "me")
  const actionValue =
    actionParam && validActionValues.includes(actionParam) ? actionParam : "all"
  const rawPage = Number.parseInt(pageParam ?? "1", 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createServerSupabaseClient()
  const auditService = new AuditLogService(new SupabaseAuditLogRepository(supabase))

  let result = { data: [] as AuditLogWithActor[], total: 0 }

  try {
    if (orgValue === "me") {
      result = await auditService.listByActor(user.id, {
        limit: PAGE_SIZE,
        offset,
        action: actionValue !== "all" ? actionValue : undefined,
      })
    } else {
      result = await auditService.listByOrganization(orgValue, {
        limit: PAGE_SIZE,
        offset,
        action: actionValue !== "all" ? actionValue : undefined,
      })
    }
  } catch {
    failed = true
  }

  if (failed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impossible de charger les logs</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération des événements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href={`/audit?org=${orgValue}`}>Réessayer</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
  const clampedPage = Math.min(page, totalPages || 1)

  if (result.data.length === 0 && page > 1) {
    return (
      <>
        <AuditLogFilters
          organizations={orgs}
          actions={AUDIT_ACTIONS}
          initialOrg={orgValue}
          initialAction={actionValue}
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <ScrollText className="size-8 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-medium">Page hors limites</p>
              <p className="text-sm text-muted-foreground">
                Aucun événement sur cette page.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={buildHref(orgValue, actionValue, 1)}>Page 1</Link>
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <AuditLogFilters
        organizations={orgs}
        actions={AUDIT_ACTIONS}
        initialOrg={orgValue}
        initialAction={actionValue}
      />

      <Card>
        <CardContent className="p-0">
          {result.data.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <ScrollText className="size-8 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium">Aucun événement</p>
                <p className="text-sm text-muted-foreground">
                  Le journal est vide pour le contexte sélectionné.
                </p>
              </div>
            </div>
          ) : (
            <ul role="list">
              {result.data.map((log) => (
                <li key={log.id} className="border-b border-border last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="text-xs">
                          {log.actor?.fullName?.charAt(0).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {log.actor?.fullName ?? "Acteur indisponible"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="lightPrimary" className="font-mono text-[11px]">
                        {formatActionLabel(log.action)}
                      </Badge>
                      <Badge variant="lightSuccess">
                        {log.status === "success" ? "Succès" : "Échec"}
                      </Badge>
                    </div>
                  </div>
                  <div className="border-t border-border/50 bg-muted/30 px-4 py-2 text-xs text-muted-foreground sm:px-6">
                    <span className="inline-block">
                      {log.resourceType ? (
                        <>
                          {log.resourceType}
                          {log.resourceId ? ` · ${log.resourceId.slice(0, 8)}` : ""}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                    {Object.keys(log.metadata).length > 0 ? (
                      <>
                        <Separator orientation="vertical" className="mx-2 inline-block h-3" />
                        <span>{formatMetadata(log.metadata)}</span>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {result.total} événement{result.total > 1 ? "s" : ""} · Page {clampedPage} sur {totalPages}
        </p>
        <div className="flex gap-2">
          {clampedPage > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={buildHref(orgValue, actionValue, clampedPage - 1)}>
                Précédent
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Précédent
            </Button>
          )}
          {clampedPage < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={buildHref(orgValue, actionValue, clampedPage + 1)}>
                Suivant
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Suivant
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function AuditLogsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="h-9 w-56 rounded-md bg-muted animate-pulse" />
        <div className="h-9 w-56 rounded-md bg-muted animate-pulse" />
      </div>
      <Card>
        <CardContent className="space-y-4 p-0">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 border-b border-border p-4 last:border-0 sm:p-5">
              <div className="size-9 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

function formatActionLabel(action: string): string {
  return AUDIT_ACTIONS.find((a) => a.value === action)?.label ?? action
}

function formatMetadata(metadata: Record<string, string | number | boolean | null>): string {
  return Object.entries(metadata)
    .map(([key, value]) => {
      const display =
        typeof value === "string" && value.length > 24
          ? `${value.slice(0, 24)}…`
          : String(value ?? "—")
      return `${key}: ${display}`
    })
    .join(" · ")
}

function buildHref(org: string, action: string, page: number): string {
  const params = new URLSearchParams()
  params.set("org", org)
  if (action && action !== "all") params.set("action", action)
  if (page > 1) params.set("page", String(page))
  return `/audit?${params.toString()}`
}