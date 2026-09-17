import type { Database } from "@/infrastructure/supabase/database"
import type {
  AuditLog,
  AuditLogActor,
  AuditLogWithActor,
  CreateAuditLogInput,
} from "@/types/audit-log"

export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"]
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"]

export type AuditLogWithActorRow = AuditLogRow & {
  profiles: Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "id" | "full_name" | "avatar_url"
  > | null
}

export function toAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    createdAt: row.created_at,
    actorId: row.actor_id,
    organizationId: row.organization_id,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    status: row.status,
    metadata: row.metadata,
  }
}

export function toAuditLogInsert(
  input: CreateAuditLogInput & {
    status: AuditLog["status"]
    metadata: AuditLog["metadata"]
  },
): AuditLogInsert {
  const insert: AuditLogInsert = {
    actor_id: input.actorId,
    action: input.action,
    status: input.status,
    metadata: input.metadata,
  }
  if (input.organizationId) insert.organization_id = input.organizationId
  if (input.resourceType) insert.resource_type = input.resourceType
  if (input.resourceId) insert.resource_id = input.resourceId
  return insert
}

export function toActor(profile: NonNullable<AuditLogWithActorRow["profiles"]>): AuditLogActor {
  return {
    id: profile.id,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
  }
}

export function toAuditLogWithActor(row: AuditLogWithActorRow): AuditLogWithActor {
  return {
    ...toAuditLog(row),
    actor: row.profiles ? toActor(row.profiles) : null,
  }
}