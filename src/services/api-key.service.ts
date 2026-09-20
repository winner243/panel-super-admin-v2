import type { ApiKeyRepository } from "@/repositories/api-key.repository"
import type { ApiKey } from "@/types/api-key"
import { parseCreateApiKey, parseUpdateApiKey } from "@/validators/api-key"

export class ApiKeyService {
  constructor(private readonly apiKeys: ApiKeyRepository) {}

  async getById(id: string): Promise<ApiKey | null> {
    return this.apiKeys.getById(id)
  }

  async listByOrganization(organizationId: string): Promise<ApiKey[]> {
    return this.apiKeys.listByOrganization(organizationId)
  }

  async listByUser(userId: string): Promise<ApiKey[]> {
    return this.apiKeys.listByUser(userId)
  }

  async create(input: unknown): Promise<ApiKey> {
    const parsed = parseCreateApiKey(input)
    return this.apiKeys.create(parsed)
  }

  async update(id: string, input: unknown): Promise<ApiKey> {
    const parsed = parseUpdateApiKey(input)
    return this.apiKeys.update(id, parsed)
  }

  async delete(id: string): Promise<void> {
    return this.apiKeys.delete(id)
  }
}
