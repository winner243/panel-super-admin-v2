import type { RoleRepository } from "@/repositories/role.repository"
import type { Role } from "@/types/role"
import { parseCreateRole, parseUpdateRole } from "@/validators/role"

export class RoleService {
  constructor(private readonly roles: RoleRepository) {}

  async list(): Promise<Role[]> {
    return this.roles.list()
  }

  async getById(id: string): Promise<Role | null> {
    return this.roles.getById(id)
  }

  async create(input: unknown): Promise<Role> {
    const parsed = parseCreateRole(input)
    return this.roles.create(parsed)
  }

  async update(id: string, input: unknown): Promise<Role> {
    const parsed = parseUpdateRole(input)

    if (parsed.name === undefined && parsed.description === undefined) {
      throw new Error("Au moins un champ (name ou description) doit être fourni.")
    }

    return this.roles.update(id, parsed)
  }
}