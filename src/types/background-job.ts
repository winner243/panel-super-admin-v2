export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled"

export type JobPriority = "low" | "normal" | "high" | "critical"

export interface BackgroundJob {
  id: string
  organizationId: string | null
  type: string
  status: JobStatus
  priority: JobPriority
  payload: Record<string, unknown> | null
  result: Record<string, unknown> | null
  attempts: number
  maxAttempts: number
  lastError: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateBackgroundJobInput = {
  organizationId?: string | null
  type: string
  priority?: JobPriority
  payload?: unknown
  maxAttempts?: number
}

export type UpdateBackgroundJobInput = Partial<
  Pick<
    BackgroundJob,
    | "status"
    | "priority"
    | "result"
    | "attempts"
    | "lastError"
    | "startedAt"
    | "completedAt"
  >
>
