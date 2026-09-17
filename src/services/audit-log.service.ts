import type { AuditLogRepository } from "@/repositories/audit-log.repository"
import type {
  AuditLog,
  AuditLogListOptions,
  AuditLogListResult,
  CreateAuditLogInput,
} from "@/types/audit-log"
import { parseCreateAuditLog } from "@/validators/audit-log"

export class AuditLogService {
  constructor(private readonly auditLogs: AuditLogRepository) {}

  async create(input: unknown): Promise<AuditLog> {
    const parsed = parseCreateAuditLog(input)
    return this.auditLogs.create(parsed)
  }

  async listByOrganization(
    organizationId: string,
    options: AuditLogListOptions,
  ): Promise<AuditLogListResult> {
    return this.auditLogs.listByOrganization(organizationId, options)
  }

  async listByActor(
    actorId: string,
    options: AuditLogListOptions,
  ): Promise<AuditLogListResult> {
    return this.auditLogs.listByActor(actorId, options)
  }
}

export type { CreateAuditLogInput }