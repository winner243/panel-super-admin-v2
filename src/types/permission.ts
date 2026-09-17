export interface Permission {
  id: string
  key: string
  name: string
  description: string | null
  createdAt: string
}

export type CreatePermissionInput = Pick<Permission, "key" | "name"> &
  Partial<Pick<Permission, "description">>