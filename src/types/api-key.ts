export type ApiKeyStatus = "active" | "revoked" | "expired"

export type ApiKeyEnvironment = "production" | "staging" | "development"

export interface ApiKey {
  id: string
  organizationId: string
  name: string
  keyPrefix: string | null
  keyHash: string
  status: ApiKeyStatus
  environment: ApiKeyEnvironment
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateApiKeyInput = Pick<
  ApiKey,
  "organizationId" | "name" | "environment" | "scopes"
> & {
  keyPrefix?: string | null
  keyHash: string
  expiresAt?: string | null
}

export type UpdateApiKeyInput = Partial<
  Pick<ApiKey, "name" | "status" | "environment" | "scopes" | "lastUsedAt" | "expiresAt">
>
