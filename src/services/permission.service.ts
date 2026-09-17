import type { PermissionRepository } from "@/repositories/permission.repository"
import type { Permission } from "@/types/permission"

export class PermissionService {
  constructor(private readonly permissions: PermissionRepository) {}

  async list(): Promise<Permission[]> {
    return this.permissions.list()
  }

  async getById(id: string): Promise<Permission | null> {
    return this.permissions.getById(id)
  }
}