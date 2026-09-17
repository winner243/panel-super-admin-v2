"use client"

import { useRouter } from "next/navigation"
import type { AuditLogActionOption } from "@/types/audit-log"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AuditLogFiltersProps {
  organizations: { id: string; name: string }[]
  actions: readonly AuditLogActionOption[]
  initialOrg: string
  initialAction: string
}

export function AuditLogFilters({
  organizations,
  actions,
  initialOrg,
  initialAction,
}: AuditLogFiltersProps) {
  const router = useRouter()

  function navigate(patch: { org?: string; action?: string }) {
    const params = new URLSearchParams()
    const org = patch.org ?? initialOrg
    const action = patch.action ?? initialAction
    params.set("org", org)
    if (action && action !== "all") params.set("action", action)
    router.push(`/audit?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="audit-org" className="text-xs">
          Contexte
        </Label>
        <Select value={initialOrg} onValueChange={(v) => navigate({ org: v })}>
          <SelectTrigger id="audit-org" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="me">Mon activité</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audit-action" className="text-xs">
          Action
        </Label>
        <Select value={initialAction} onValueChange={(v) => navigate({ action: v })}>
          <SelectTrigger id="audit-action" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}