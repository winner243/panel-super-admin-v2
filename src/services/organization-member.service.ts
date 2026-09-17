import type { OrganizationMemberRepository } from "@/repositories/organization-member.repository"
import type {
  OrganizationMember,
  OrganizationMemberWithDetails,
} from "@/types/organization-member"
import {
  parseAddOrganizationMember,
  parseChangeMemberRole,
} from "@/validators/organization-member"

export class OrganizationMemberService {
  constructor(private readonly members: OrganizationMemberRepository) {}

  async listByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    return this.members.listByOrganization(organizationId)
  }

  async listByOrganizationWithDetails(
    organizationId: string,
  ): Promise<OrganizationMemberWithDetails[]> {
    return this.members.listByOrganizationWithDetails(organizationId)
  }

  async listByUser(userId: string): Promise<OrganizationMember[]> {
    return this.members.listByUser(userId)
  }

  async add(input: unknown): Promise<OrganizationMember> {
    const parsed = parseAddOrganizationMember(input)
    return this.members.add(parsed)
  }

  async changeRole(
    organizationId: string,
    userId: string,
    input: unknown,
  ): Promise<OrganizationMember> {
    const parsed = parseChangeMemberRole(input)
    return this.members.changeRole(organizationId, userId, parsed)
  }

  async remove(organizationId: string, userId: string): Promise<void> {
    return this.members.remove(organizationId, userId)
  }

  async hasPermission(organizationId: string, permissionKey: string): Promise<boolean> {
    return this.members.hasPermission(organizationId, permissionKey)
  }
}