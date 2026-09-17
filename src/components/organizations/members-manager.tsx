import { MemberRow } from "./member-row"
import type { OrganizationMemberWithDetails } from "@/types/organization-member"
import type { Role } from "@/types/role"

export function MembersManager({
  organizationId,
  members,
  roles,
  canManage,
  currentUserId,
}: {
  organizationId: string
  members: OrganizationMemberWithDetails[]
  roles: Role[]
  canManage: boolean
  currentUserId: string
}) {
  const ownersCount = members.filter((m) => m.roleName === "owner").length

  const assignableRoles = roles.filter((role) => role.name !== "owner")

  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <MemberRow
          key={member.userId}
          organizationId={organizationId}
          member={member}
          roles={assignableRoles}
          canManage={canManage}
          isLastOwner={member.roleName === "owner" && ownersCount <= 1}
          isSelf={member.userId === currentUserId}
        />
      ))}
    </ul>
  )
}