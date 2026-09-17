import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import {
  toAuditLog,
  toAuditLogInsert,
  toAuditLogWithActor,
  type AuditLogRow,
  type AuditLogWithActorRow,
} from "@/adapters/audit-log"
import type {
  AuditLog,
  AuditLogListOptions,
  AuditLogListResult,
  CreateAuditLogInput,
} from "@/types/audit-log"

type AuditLogScope =
  | { kind: "organization"; organizationId: string }
  | { kind: "actor"; actorId: string }

export interface AuditLogRepository {
  create(input: CreateAuditLogInput & {
    status: AuditLog["status"]
    metadata: AuditLog["metadata"]
  }): Promise<AuditLog>
  listByOrganization(
    organizationId: string,
    options: AuditLogListOptions,
  ): Promise<AuditLogListResult>
  listByActor(actorId: string, options: AuditLogListOptions): Promise<AuditLogListResult>
}

export class SupabaseAuditLogRepository implements AuditLogRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(
    input: CreateAuditLogInput & {
      status: AuditLog["status"]
      metadata: AuditLog["metadata"]
    },
  ): Promise<AuditLog> {
    const { data, error } = await this.client
      .from("audit_logs")
      .insert(toAuditLogInsert(input))
      .select()
      .single<AuditLogRow>()

    if (error) throw error
    return toAuditLog(data)
  }

  listByOrganization(
    organizationId: string,
    options: AuditLogListOptions,
  ): Promise<AuditLogListResult> {
    return this.list({ kind: "organization", organizationId }, options)
  }

  listByActor(actorId: string, options: AuditLogListOptions): Promise<AuditLogListResult> {
    return this.list({ kind: "actor", actorId }, options)
  }

  private async list(
    scope: AuditLogScope,
    options: AuditLogListOptions,
  ): Promise<AuditLogListResult> {
    const dataBuilder = this.client
      .from("audit_logs")
      .select("*, profiles(id, full_name, avatar_url)")
    const dataScoped =
      scope.kind === "organization"
        ? dataBuilder.eq("organization_id", scope.organizationId)
        : dataBuilder.eq("actor_id", scope.actorId).is("organization_id", null)
    const dataFiltered = options.action
      ? dataScoped.eq("action", options.action)
      : dataScoped

    const countBuilder = this.client
      .from("audit_logs")
      .select("id", { count: "exact", head: true })
    const countScoped =
      scope.kind === "organization"
        ? countBuilder.eq("organization_id", scope.organizationId)
        : countBuilder.eq("actor_id", scope.actorId).is("organization_id", null)
    const countFiltered = options.action
      ? countScoped.eq("action", options.action)
      : countScoped

    const [dataResult, countResult] = await Promise.all([
      dataFiltered
        .order("created_at", { ascending: false })
        .range(options.offset, options.offset + options.limit - 1)
        .returns<AuditLogWithActorRow[]>(),
      countFiltered,
    ])

    if (dataResult.error) throw dataResult.error
    if (countResult.error) throw countResult.error

    return {
      data: dataResult.data.map(toAuditLogWithActor),
      total: countResult.count ?? 0,
    }
  }
}