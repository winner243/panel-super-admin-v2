import { z } from "zod"

export const addOrganizationMemberSchema = z.object({
  organizationId: z.uuid(),
  userId: z.uuid(),
  roleId: z.uuid(),
})

export const changeMemberRoleSchema = z.object({
  roleId: z.uuid(),
})

export type AddOrganizationMemberSchema = z.infer<typeof addOrganizationMemberSchema>
export type ChangeMemberRoleSchema = z.infer<typeof changeMemberRoleSchema>

export function parseAddOrganizationMember(input: unknown) {
  return addOrganizationMemberSchema.parse(input)
}

export function parseChangeMemberRole(input: unknown) {
  return changeMemberRoleSchema.parse(input)
}