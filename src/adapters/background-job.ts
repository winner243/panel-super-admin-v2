import type { Database } from "@/infrastructure/supabase/database"
import type {
  BackgroundJob,
  CreateBackgroundJobInput,
  UpdateBackgroundJobInput,
} from "@/types/background-job"

export type BackgroundJobRow =
  Database["public"]["Tables"]["background_jobs"]["Row"]
export type BackgroundJobInsert =
  Database["public"]["Tables"]["background_jobs"]["Insert"]
export type BackgroundJobUpdate =
  Database["public"]["Tables"]["background_jobs"]["Update"]

function toRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

export function toBackgroundJob(row: BackgroundJobRow): BackgroundJob {
  return {
    id: row.id,
    organizationId: row.organization_id,
    type: row.type,
    status: row.status as BackgroundJob["status"],
    priority: row.priority as BackgroundJob["priority"],
    payload: toRecord(row.payload),
    result: toRecord(row.result),
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    lastError: row.last_error,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toBackgroundJobInsert(
  input: CreateBackgroundJobInput
): BackgroundJobInsert {
  return {
    organization_id: input.organizationId ?? null,
    type: input.type,
    priority: input.priority ?? "normal",
    payload: toRecord(input.payload) ?? {},
    max_attempts: input.maxAttempts ?? 3,
  }
}

export function toBackgroundJobUpdate(
  input: UpdateBackgroundJobInput
): BackgroundJobUpdate {
  return {
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.result !== undefined && { result: toRecord(input.result) ?? undefined }),
    ...(input.attempts !== undefined && { attempts: input.attempts }),
    ...(input.lastError !== undefined && { last_error: input.lastError }),
    ...(input.startedAt !== undefined && { started_at: input.startedAt }),
    ...(input.completedAt !== undefined && { completed_at: input.completedAt }),
  }
}
