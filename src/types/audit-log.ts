export type AuditLogStatus = "success" | "failed"

export type AuditLogMetadataValue = string | number | boolean | null

export type AuditLogMetadata = Record<string, AuditLogMetadataValue>

export interface AuditLog {
  id: string
  createdAt: string
  actorId: string | null
  organizationId: string | null
  action: string
  resourceType: string | null
  resourceId: string | null
  status: AuditLogStatus
  metadata: AuditLogMetadata
}

export interface AuditLogActor {
  id: string
  fullName: string | null
  avatarUrl: string | null
}

export interface AuditLogWithActor extends AuditLog {
  actor: AuditLogActor | null
}

export type CreateAuditLogInput = Pick<AuditLog, "action"> &
  Partial<Pick<AuditLog, "resourceType" | "resourceId" | "status">> & {
    actorId: string
    organizationId?: string | null
    metadata?: unknown
  }

export interface AuditLogListOptions {
  limit: number
  offset: number
  action?: string
}

export interface AuditLogListResult {
  data: AuditLogWithActor[]
  total: number
}

export interface AuditLogActionOption {
  value: string
  label: string
}

export const AUDIT_ACTIONS: readonly AuditLogActionOption[] = [
  { value: "organizations.create", label: "Création d’organisation" },
  { value: "organizations.update", label: "Modification d’organisation" },
  { value: "members.rolechange", label: "Changement de rôle" },
  { value: "members.remove", label: "Retrait d’un membre" },
  { value: "profile.update", label: "Modification de profil" },
  { value: "auth.login", label: "Connexion" },
  { value: "auth.signup", label: "Inscription" },
  { value: "auth.logout", label: "Déconnexion" },
]