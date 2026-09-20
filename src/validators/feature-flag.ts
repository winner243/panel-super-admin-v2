import { z } from "zod"

export const featureFlagScopeSchema = z.enum(["global", "organization"])

export const createFeatureFlagSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  enabled: z.boolean().default(false),
  scope: featureFlagScopeSchema.default("global"),
})

export const updateFeatureFlagSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  enabled: z.boolean().optional(),
  scope: featureFlagScopeSchema.optional(),
})

export type CreateFeatureFlagSchema = z.infer<typeof createFeatureFlagSchema>
export type UpdateFeatureFlagSchema = z.infer<typeof updateFeatureFlagSchema>

export function parseCreateFeatureFlag(input: unknown) {
  return createFeatureFlagSchema.parse(input)
}

export function parseUpdateFeatureFlag(input: unknown) {
  return updateFeatureFlagSchema.parse(input)
}
