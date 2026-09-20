import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateFeatureFlagInput,
  FeatureFlag,
  UpdateFeatureFlagInput,
} from "@/types/feature-flag"

export type FeatureFlagRow = Database["public"]["Tables"]["feature_flags"]["Row"]
export type FeatureFlagInsert = Database["public"]["Tables"]["feature_flags"]["Insert"]
export type FeatureFlagUpdate = Database["public"]["Tables"]["feature_flags"]["Update"]

export function toFeatureFlag(row: FeatureFlagRow): FeatureFlag {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    enabled: row.enabled,
    scope: row.scope as FeatureFlag["scope"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toFeatureFlagInsert(input: CreateFeatureFlagInput): FeatureFlagInsert {
  return {
    key: input.key,
    name: input.name,
    description: input.description ?? null,
    enabled: input.enabled,
    scope: input.scope,
  }
}

export function toFeatureFlagUpdate(input: UpdateFeatureFlagInput): FeatureFlagUpdate {
  return {
    ...(input.key !== undefined && { key: input.key }),
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.enabled !== undefined && { enabled: input.enabled }),
    ...(input.scope !== undefined && { scope: input.scope }),
  }
}
