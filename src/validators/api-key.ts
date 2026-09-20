import { z } from "zod"

export const apiKeyStatusSchema = z.enum(["active", "revoked", "expired"])

export const apiKeyEnvironmentSchema = z.enum(["production", "staging", "development"])

export const createApiKeySchema = z.object({
  organizationId: z.uuid(),
  name: z.string().trim().min(1).max(100),
  keyPrefix: z.string().trim().max(20).optional(),
  keyHash: z.string().trim().min(1).max(255),
  status: apiKeyStatusSchema.default("active"),
  environment: apiKeyEnvironmentSchema.default("production"),
  scopes: z.array(z.string().trim().min(1).max(100)).default([]),
  expiresAt: z.string().datetime().nullable().optional(),
})

export const updateApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  status: apiKeyStatusSchema.optional(),
  environment: apiKeyEnvironmentSchema.optional(),
  scopes: z.array(z.string().trim().min(1).max(100)).optional(),
  lastUsedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
})

export type CreateApiKeySchema = z.infer<typeof createApiKeySchema>
export type UpdateApiKeySchema = z.infer<typeof updateApiKeySchema>

export function parseCreateApiKey(input: unknown) {
  return createApiKeySchema.parse(input)
}

export function parseUpdateApiKey(input: unknown) {
  return updateApiKeySchema.parse(input)
}
