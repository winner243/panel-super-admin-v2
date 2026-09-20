import type { Database } from "@/infrastructure/supabase/database"
import type {
  ApiKey,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from "@/types/api-key"

export type ApiKeyRow = Database["public"]["Tables"]["api_keys"]["Row"]
export type ApiKeyInsert = Database["public"]["Tables"]["api_keys"]["Insert"]
export type ApiKeyUpdate = Database["public"]["Tables"]["api_keys"]["Update"]

function toScopes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string")
  }
  return []
}

export function toApiKey(row: ApiKeyRow): ApiKey {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    keyPrefix: row.key_prefix,
    keyHash: row.key_hash,
    status: row.status as ApiKey["status"],
    environment: row.environment as ApiKey["environment"],
    scopes: toScopes(row.scopes),
    lastUsedAt: row.last_used_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toApiKeyInsert(input: CreateApiKeyInput): ApiKeyInsert {
  return {
    organization_id: input.organizationId,
    name: input.name,
    key_prefix: input.keyPrefix ?? null,
    key_hash: input.keyHash,
    environment: input.environment ?? "production",
    scopes: input.scopes ?? [],
    expires_at: input.expiresAt ?? null,
  }
}

export function toApiKeyUpdate(input: UpdateApiKeyInput): ApiKeyUpdate {
  return {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.environment !== undefined && { environment: input.environment }),
    ...(input.scopes !== undefined && { scopes: input.scopes }),
    ...(input.lastUsedAt !== undefined && { last_used_at: input.lastUsedAt }),
    ...(input.expiresAt !== undefined && { expires_at: input.expiresAt }),
  }
}
