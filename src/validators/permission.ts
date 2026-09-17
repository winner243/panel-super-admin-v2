import { z } from "zod"

export const permissionKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:\.[a-z0-9]+)+$/)

export const permissionNameSchema = z.string().trim().min(1).max(120)

export const permissionDescriptionSchema = z.string().trim().max(300)

export const createPermissionSchema = z.object({
  key: permissionKeySchema,
  name: permissionNameSchema,
  description: permissionDescriptionSchema.nullish(),
})

export type CreatePermissionSchema = z.infer<typeof createPermissionSchema>

export function parseCreatePermission(input: unknown) {
  return createPermissionSchema.parse(input)
}

export function parsePermissionKey(input: unknown) {
  return permissionKeySchema.parse(input)
}