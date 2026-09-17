export interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export type CreateRoleInput = Pick<Role, "name"> &
  Partial<Pick<Role, "description" | "isSystem">>

export type UpdateRoleInput = Partial<Pick<Role, "name" | "description">>