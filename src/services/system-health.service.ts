import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type { ComponentHealth, HealthStatus, SystemHealthSnapshot } from "@/types/system-health"

function worstStatus(statuses: HealthStatus[]): HealthStatus {
  if (statuses.includes("down")) return "down"
  if (statuses.includes("degraded")) return "degraded"
  return "healthy"
}

export class SystemHealthService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getSnapshot(): Promise<SystemHealthSnapshot> {
    const components: ComponentHealth[] = []

    const dbHealth = await this.checkDatabase()
    components.push(dbHealth)

    const authHealth = await this.checkAuth()
    components.push(authHealth)

    const storageHealth = await this.checkStorage()
    components.push(storageHealth)

    const overallStatus = worstStatus(components.map((c) => c.status))

    return {
      status: overallStatus,
      uptimeSeconds: 0,
      version: "2.0.0",
      components,
      checkedAt: new Date().toISOString(),
    }
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    const start = Date.now()
    try {
      await this.client.from("organizations").select("id").limit(1)
      return {
        id: "database",
        name: "Base de données",
        status: "healthy",
        latencyMs: Date.now() - start,
        lastCheckedAt: new Date().toISOString(),
        message: null,
      }
    } catch {
      return {
        id: "database",
        name: "Base de données",
        status: "down",
        latencyMs: Date.now() - start,
        lastCheckedAt: new Date().toISOString(),
        message: "Connexion échouée",
      }
    }
  }

  private async checkAuth(): Promise<ComponentHealth> {
    const start = Date.now()
    try {
      const { error } = await this.client.auth.getSession()
      return {
        id: "auth",
        name: "Authentification",
        status: error ? "degraded" : "healthy",
        latencyMs: Date.now() - start,
        lastCheckedAt: new Date().toISOString(),
        message: error?.message ?? null,
      }
    } catch {
      return {
        id: "auth",
        name: "Authentification",
        status: "down",
        latencyMs: Date.now() - start,
        lastCheckedAt: new Date().toISOString(),
        message: "Service indisponible",
      }
    }
  }

  private async checkStorage(): Promise<ComponentHealth> {
    return {
      id: "storage",
      name: "Stockage",
      status: "healthy",
      latencyMs: null,
      lastCheckedAt: new Date().toISOString(),
      message: "Vérification non disponible côté client",
    }
  }
}
