import { z } from "zod"
import type {
  AuditLogMetadata,
  AuditLogStatus,
} from "@/types/audit-log"

const auditLogActionSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:\.[a-z0-9]+)+$/)

const auditLogResourceTypeSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9_]+$/)

const auditLogResourceIdSchema = z.string().trim().min(1).max(80)

const auditLogStatusSchema: z.ZodType<AuditLogStatus> = z.enum([
  "success",
  "failed",
])

const MAX_METADATA_KEYS = 12
const MAX_METADATA_KEY_LENGTH = 40
const MAX_METADATA_STRING_LENGTH = 120

export function sanitizeAuditMetadata(input: unknown): AuditLogMetadata {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {}
  }

  const source = input as Record<string, unknown>
  const output: AuditLogMetadata = {}

  for (const [key, value] of Object.entries(source)) {
    if (Object.keys(output).length >= MAX_METADATA_KEYS) break
    if (key.length === 0 || key.length > MAX_METADATA_KEY_LENGTH) continue
    if (value === undefined) continue
    if (typeof value === "object" && value !== null) continue

    if (typeof value === "string") {
      if (value.length === 0 || value.length > MAX_METADATA_STRING_LENGTH) continue
      output[key] = value
    } else if (typeof value === "number") {
      if (!Number.isFinite(value)) continue
      output[key] = value
    } else if (typeof value === "boolean") {
      output[key] = value
    } else if (value === null) {
      output[key] = null
    }
  }

  return output
}

export const createAuditLogSchema = z.object({
  actorId: z.string().trim().min(1).max(100),
  organizationId: z.uuid().nullish(),
  action: auditLogActionSchema,
  resourceType: auditLogResourceTypeSchema.optional(),
  resourceId: auditLogResourceIdSchema.optional(),
  status: auditLogStatusSchema.default("success"),
  metadata: z.unknown().optional(),
})

export type CreateAuditLogSchema = z.infer<typeof createAuditLogSchema>

export function parseCreateAuditLog(input: unknown) {
  const parsed = createAuditLogSchema.parse(input)
  return {
    ...parsed,
    status: parsed.status,
    metadata: sanitizeAuditMetadata(parsed.metadata),
  }
}