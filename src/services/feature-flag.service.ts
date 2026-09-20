import type { FeatureFlagRepository } from "@/repositories/feature-flag.repository"
import type { FeatureFlag } from "@/types/feature-flag"
import { parseCreateFeatureFlag, parseUpdateFeatureFlag } from "@/validators/feature-flag"

export class FeatureFlagService {
  constructor(private readonly featureFlags: FeatureFlagRepository) {}

  async getById(id: string): Promise<FeatureFlag | null> {
    return this.featureFlags.getById(id)
  }

  async getByKey(key: string): Promise<FeatureFlag | null> {
    return this.featureFlags.getByKey(key)
  }

  async list(): Promise<FeatureFlag[]> {
    return this.featureFlags.list()
  }

  async create(input: unknown): Promise<FeatureFlag> {
    const parsed = parseCreateFeatureFlag(input)

    const existing = await this.featureFlags.getByKey(parsed.key)
    if (existing) {
      throw new Error(`Un feature flag avec la clé "${parsed.key}" existe déjà.`)
    }

    return this.featureFlags.create(parsed)
  }

  async update(id: string, input: unknown): Promise<FeatureFlag> {
    const parsed = parseUpdateFeatureFlag(input)

    if (parsed.key) {
      const existing = await this.featureFlags.getByKey(parsed.key)
      if (existing && existing.id !== id) {
        throw new Error(`Un feature flag avec la clé "${parsed.key}" existe déjà.`)
      }
    }

    return this.featureFlags.update(id, parsed)
  }

  async delete(id: string): Promise<void> {
    return this.featureFlags.delete(id)
  }
}
