export type HealthStatus = "healthy" | "degraded" | "down"

export interface ComponentHealth {
  id: string
  name: string
  status: HealthStatus
  latencyMs: number | null
  lastCheckedAt: string
  message: string | null
}

export interface SystemHealthSnapshot {
  status: HealthStatus
  uptimeSeconds: number
  version: string
  components: ComponentHealth[]
  checkedAt: string
}
