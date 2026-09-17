import type { OrganizationRepository } from "@/repositories/organization.repository"
import type { Organization } from "@/types/organization"
import { parseCreateOrganization, parseUpdateOrganization } from "@/validators/organization"

export class OrganizationService {
  constructor(private readonly organizations: OrganizationRepository) {}

  async getById(id: string): Promise<Organization | null> {
    return this.organizations.getById(id)
  }

  async getBySlug(slug: string): Promise<Organization | null> {
    return this.organizations.getBySlug(slug)
  }

  async listByUser(userId: string): Promise<Organization[]> {
    return this.organizations.listByUser(userId)
  }

  async create(input: unknown): Promise<Organization> {
    const parsed = parseCreateOrganization(input)
    return this.organizations.create(parsed)
  }

  async update(id: string, input: unknown): Promise<Organization> {
    const parsed = parseUpdateOrganization(input)

    if (parsed.name === undefined && parsed.slug === undefined) {
      throw new Error("Au moins un champ (name ou slug) doit être fourni.")
    }

    return this.organizations.update(id, parsed)
  }
}