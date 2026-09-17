import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateOrganizationInput,
  Organization,
  UpdateOrganizationInput,
} from "@/types/organization"
import {
  toOrganization,
  toOrganizationInsert,
  toOrganizationUpdate,
  type OrganizationRow,
} from "@/adapters/organization"

export interface OrganizationRepository {
  getById(id: string): Promise<Organization | null>
  getBySlug(slug: string): Promise<Organization | null>
  listByUser(userId: string): Promise<Organization[]>
  create(input: CreateOrganizationInput): Promise<Organization>
  update(id: string, input: UpdateOrganizationInput): Promise<Organization>
}

export class SupabaseOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await this.client
      .from("organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle<OrganizationRow>()

    if (error) throw error
    return data ? toOrganization(data) : null
  }

  async getBySlug(slug: string): Promise<Organization | null> {
    const { data, error } = await this.client
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle<OrganizationRow>()

    if (error) throw error
    return data ? toOrganization(data) : null
  }

  async listByUser(userId: string): Promise<Organization[]> {
    const { data, error } = await this.client
      .from("organizations")
      .select("*, membership:organization_members!inner(organization_id)")
      .eq("membership.user_id", userId)
      .order("name", { ascending: true })
      .returns<OrganizationRow[]>()

    if (error) throw error
    return data.map(toOrganization)
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    const { data, error } = await this.client
      .from("organizations")
      .insert(toOrganizationInsert(input))
      .select()
      .single<OrganizationRow>()

    if (error) throw error
    return toOrganization(data)
  }

  async update(id: string, input: UpdateOrganizationInput): Promise<Organization> {
    const { data, error } = await this.client
      .from("organizations")
      .update(toOrganizationUpdate(input))
      .eq("id", id)
      .select()
      .single<OrganizationRow>()

    if (error) throw error
    return toOrganization(data)
  }
}