import { describe, expect, it } from "vitest"
import {
  toAuditLog,
  toAuditLogInsert,
  toAuditLogWithActor,
  type AuditLogRow,
  type AuditLogWithActorRow,
} from "./audit-log"

const row: AuditLogRow = {
  id: "00000000-0000-0000-0000-000000000001",
  created_at: "2026-03-15T10:30:00.000Z",
  actor_id: "00000000-0000-0000-0000-000000000002",
  organization_id: "00000000-0000-0000-0000-000000000003",
  action: "organizations.update",
  resource_type: "organization",
  resource_id: "00000000-0000-0000-0000-000000000003",
  status: "success",
  metadata: { fields: "name" },
}

describe("toAuditLog", () => {
  it("mappe une ligne vers le domaine", () => {
    const result = toAuditLog(row)
    expect(result).toEqual({
      id: row.id,
      createdAt: row.created_at,
      actorId: row.actor_id,
      organizationId: row.organization_id,
      action: "organizations.update",
      resourceType: "organization",
      resourceId: row.resource_id,
      status: "success",
      metadata: { fields: "name" },
    })
  })

  it("conserve les champs null", () => {
    const r: AuditLogRow = { ...row, actor_id: null, organization_id: null, resource_type: null, resource_id: null }
    const result = toAuditLog(r)
    expect(result.actorId).toBeNull()
    expect(result.organizationId).toBeNull()
    expect(result.resourceType).toBeNull()
    expect(result.resourceId).toBeNull()
  })
})

describe("toAuditLogInsert", () => {
  it("construit un insert minimal sans optionnels", () => {
    const insert = toAuditLogInsert({
      actorId: "00000000-0000-0000-0000-000000000002",
      action: "profile.update",
      status: "success",
      metadata: {},
    })
    expect(insert).toEqual({
      actor_id: "00000000-0000-0000-0000-000000000002",
      action: "profile.update",
      status: "success",
      metadata: {},
    })
  })

  it("inclut les champs optionnels fournis", () => {
    const insert = toAuditLogInsert({
      actorId: "00000000-0000-0000-0000-000000000002",
      organizationId: "00000000-0000-0000-0000-000000000003",
      action: "members.rolechange",
      resourceType: "member",
      resourceId: "00000000-0000-0000-0000-000000000004",
      status: "success",
      metadata: { fromRoleId: "aaa", toRoleId: "bbb" },
    })
    expect(insert.organization_id).toBe("00000000-0000-0000-0000-000000000003")
    expect(insert.resource_type).toBe("member")
    expect(insert.resource_id).toBe("00000000-0000-0000-0000-000000000004")
  })
})

describe("toAuditLogWithActor", () => {
  const rowWithActor: AuditLogWithActorRow = {
    ...row,
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "Marie Dupont",
      avatar_url: null,
    },
  }

  it("mappe les données de l'acteur", () => {
    const result = toAuditLogWithActor(rowWithActor)
    expect(result.actor).toEqual({
      id: "00000000-0000-0000-0000-000000000002",
      fullName: "Marie Dupont",
      avatarUrl: null,
    })
  })

  it("renvoie acteur null si profiles est absent (RLS)", () => {
    const result = toAuditLogWithActor({ ...rowWithActor, profiles: null })
    expect(result.actor).toBeNull()
  })
})