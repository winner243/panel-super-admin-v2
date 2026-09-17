import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  AddOrganizationMemberInput,
  OrganizationMember,
  OrganizationMemberWithDetails,
  UpdateOrganizationMemberInput,
} from "@/types/organization-member"
import {
  toOrganizationMember,
  toOrganizationMemberInsert,
  toOrganizationMemberUpdate,
  toOrganizationMemberWithDetails,
  type OrganizationMemberRow,
  type OrganizationMemberWithProfileRow,
} from "@/adapters/organization-member"

export interface OrganizationMemberRepository {
  listByOrganization(organizationId: string): Promise<OrganizationMember[]>
  listByOrganizationWithDetails(
    organizationId: string,
  ): Promise<OrganizationMemberWithDetails[]>
  listByUser(userId: string): Promise<OrganizationMember[]>
  add(input: AddOrganizationMemberInput): Promise<OrganizationMember>
  changeRole(
    organizationId: string,
    userId: string,
    input: UpdateOrganizationMemberInput,
  ): Promise<OrganizationMember>
  remove(organizationId: string, userId: string): Promise<void>
  hasPermission(organizationId: string, permissionKey: string): Promise<boolean>
}

export class SupabaseOrganizationMemberRepository
  implements OrganizationMemberRepository
{
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    const { data, error } = await this.client
      .from("organization_members")
      .select("*")
      .eq("organization_id", organizationId)

    if (error) throw error
    return data.map(toOrganizationMember)
  }

  async listByOrganizationWithDetails(
    organizationId: string,
  ): Promise<OrganizationMemberWithDetails[]> {
    const { data, error } = await this.client
      .from("organization_members")
      .select(
        "organization_id, user_id, role_id, created_at, profiles(id, full_name, avatar_url), roles(id, name)",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true })
      .returns<OrganizationMemberWithProfileRow[]>()

    if (error) throw error
    return data.map(toOrganizationMemberWithDetails)
  }

  async listByUser(userId: string): Promise<OrganizationMember[]> {
    const { data, error } = await this.client
      .from("organization_members")
      .select("*")
      .eq("user_id", userId)

    if (error) throw error
    return data.map(toOrganizationMember)
  }

  async add(input: AddOrganizationMemberInput): Promise<OrganizationMember> {
    const { data, error } = await this.client
      .from("organization_members")
      .insert(toOrganizationMemberInsert(input))
      .select()
      .single<OrganizationMemberRow>()

    if (error) throw error
    return toOrganizationMember(data)
  }

  async changeRole(
    organizationId: string,
    userId: string,
    input: UpdateOrganizationMemberInput,
  ): Promise<OrganizationMember> {
    const { data, error } = await this.client
      .from("organization_members")
      .update(toOrganizationMemberUpdate(input))
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .select()
      .single<OrganizationMemberRow>()

    if (error) throw error
    return toOrganizationMember(data)
  }

  async remove(organizationId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from("organization_members")
      .delete()
      .eq("organization_id", organizationId)
      .eq("user_id", userId)

    if (error) throw error
  }

  async hasPermission(organizationId: string, permissionKey: string): Promise<boolean> {
    const { data, error } = await this.client.rpc("has_org_permission", {
      org_id: organizationId,
      perm_key: permissionKey,
    })

    if (error) throw error
    return Boolean(data)
  }
}