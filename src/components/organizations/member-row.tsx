"use client"

import { useEffect, useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  changeMemberRoleAction,
  removeMemberAction,
} from "@/app/(DashboardLayout)/organizations/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OrganizationMemberWithDetails } from "@/types/organization-member"
import type { Role } from "@/types/role"
import type { ActionFormState } from "@/types/actions"

const idleState: ActionFormState = { status: "idle" }

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  member: "Membre",
}

function roleLabel(roleName: string): string {
  return ROLE_LABELS[roleName] ?? roleName.charAt(0).toUpperCase() + roleName.slice(1)
}

export function MemberRow({
  organizationId,
  member,
  roles,
  canManage,
  isLastOwner,
  isSelf,
}: {
  organizationId: string
  member: OrganizationMemberWithDetails
  roles: Role[]
  canManage: boolean
  isLastOwner: boolean
  isSelf: boolean
}) {
  const router = useRouter()
  const [role, setRole] = useState(member.roleId)
  const [confirmingRemoval, setConfirmingRemoval] = useState(false)

  const [roleState, roleAction, rolePending] = useActionState(
    changeMemberRoleAction,
    idleState,
  )
  const [removeState, removeAction, removePending] = useActionState(
    removeMemberAction,
    idleState,
  )

  useEffect(() => {
    if (roleState.status === "success" || removeState.status === "success") {
      router.refresh()
    }
  }, [roleState.status, removeState.status, router])

  const displayName = member.fullName ?? "Utilisateur non défini"
  const initial = (member.fullName ?? "U").charAt(0).toUpperCase()

  return (
    <li className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>
          {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt="" /> : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium">{displayName}</p>
            {isSelf ? <Badge variant="gray">vous</Badge> : null}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {roleLabel(member.roleName)}
          </p>
        </div>
      </div>

      {canManage ? (
        <div className="flex flex-wrap items-center gap-2">
          {roleState.status === "error" ? (
            <p role="alert" className="text-sm text-destructive" aria-live="polite">
              {roleState.message ?? "Une erreur est survenue."}
            </p>
          ) : removeState.status === "error" ? (
            <p role="alert" className="text-sm text-destructive" aria-live="polite">
              {removeState.message ?? "Une erreur est survenue."}
            </p>
          ) : null}

          <form action={roleAction} className="flex items-center gap-2" aria-busy={rolePending}>
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="userId" value={member.userId} />
            <input type="hidden" name="roleId" value={role} />
            <Select
              value={role}
              onValueChange={setRole}
              disabled={rolePending || isLastOwner}>
              <SelectTrigger
                className="w-44"
                aria-label={`Rôle de ${displayName}`}
                title={
                  isLastOwner
                    ? "Il n’est pas possible de rétrograder le dernier propriétaire."
                    : undefined
                }>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {roleLabel(candidate.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={rolePending || isLastOwner}
              title={
                isLastOwner
                  ? "Il n’est pas possible de rétrograder le dernier propriétaire."
                  : undefined
              }>
              {rolePending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Rôle
            </Button>
          </form>

          <form action={removeAction} aria-busy={removePending}>
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="userId" value={member.userId} />
            <Button
              type="submit"
              size="sm"
              variant={confirmingRemoval ? "destructive" : "outlinewarning"}
              disabled={removePending || isLastOwner}
              title={
                isLastOwner
                  ? "Il n’est pas possible de retirer le dernier propriétaire."
                  : undefined
              }
              onClick={(event) => {
                if (!confirmingRemoval) {
                  event.preventDefault()
                  setConfirmingRemoval(true)
                }
              }}
              onBlur={() => setConfirmingRemoval(false)}
              aria-live="polite">
              {removePending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {confirmingRemoval ? "Confirmer le retrait" : "Retirer"}
            </Button>
          </form>
        </div>
      ) : null}
    </li>
  )
}