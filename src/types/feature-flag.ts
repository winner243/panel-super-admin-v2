export type FeatureFlagScope = "global" | "organization"

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  scope: FeatureFlagScope
  createdAt: string
  updatedAt: string
}

export type CreateFeatureFlagInput = Pick<FeatureFlag, "key" | "name" | "enabled" | "scope"> & {
  description?: string | null
}

export type UpdateFeatureFlagInput = Partial<
  Pick<FeatureFlag, "key" | "name" | "description" | "enabled" | "scope">
>
