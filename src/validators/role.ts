import { z } from "zod"

export const roleNameSchema = z.string().trim().min(1).max(80)

export const createRoleSchema = z.object({
  name: roleNameSchema,
  description: z.string().trim().max(300).nullish(),
  isSystem: z.boolean().optional(),
})

export const updateRoleSchema = z.object({
  name: roleNameSchema.optional(),
  description: z.string().trim().max(300).nullish(),
})

export type CreateRoleSchema = z.infer<typeof createRoleSchema>
export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>

export function parseCreateRole(input: unknown) {
  return createRoleSchema.parse(input)
}

export function parseUpdateRole(input: unknown) {
  return updateRoleSchema.parse(input)
}