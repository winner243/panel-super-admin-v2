import { z } from "zod"

export const assignRolePermissionSchema = z.object({
  roleId: z.uuid(),
  permissionId: z.uuid(),
})

export type AssignRolePermissionSchema = z.infer<typeof assignRolePermissionSchema>

export function parseAssignRolePermission(input: unknown) {
  return assignRolePermissionSchema.parse(input)
}