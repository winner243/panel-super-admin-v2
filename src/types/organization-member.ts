export interface OrganizationMember {
  organizationId: string
  userId: string
  roleId: string
  createdAt: string
}

export interface OrganizationMemberWithDetails {
  userId: string
  roleId: string
  roleName: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: string
}

export type AddOrganizationMemberInput = Pick<OrganizationMember, "organizationId" | "userId" | "roleId">

export type UpdateOrganizationMemberInput = { roleId: string }