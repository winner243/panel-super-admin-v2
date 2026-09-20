import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateFeatureFlagInput,
  FeatureFlag,
  UpdateFeatureFlagInput,
} from "@/types/feature-flag"
import {
  toFeatureFlag,
  toFeatureFlagInsert,
  toFeatureFlagUpdate,
  type FeatureFlagRow,
} from "@/adapters/feature-flag"

export interface FeatureFlagRepository {
  getById(id: string): Promise<FeatureFlag | null>
  getByKey(key: string): Promise<FeatureFlag | null>
  list(): Promise<FeatureFlag[]>
  create(input: CreateFeatureFlagInput): Promise<FeatureFlag>
  update(id: string, input: UpdateFeatureFlagInput): Promise<FeatureFlag>
  delete(id: string): Promise<void>
}

export class SupabaseFeatureFlagRepository implements FeatureFlagRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<FeatureFlag | null> {
    const { data, error } = await this.client
      .from("feature_flags")
      .select("*")
      .eq("id", id)
      .maybeSingle<FeatureFlagRow>()

    if (error) throw error
    return data ? toFeatureFlag(data) : null
  }

  async getByKey(key: string): Promise<FeatureFlag | null> {
    const { data, error } = await this.client
      .from("feature_flags")
      .select("*")
      .eq("key", key)
      .maybeSingle<FeatureFlagRow>()

    if (error) throw error
    return data ? toFeatureFlag(data) : null
  }

  async list(): Promise<FeatureFlag[]> {
    const { data, error } = await this.client
      .from("feature_flags")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<FeatureFlagRow[]>()

    if (error) throw error
    return data.map(toFeatureFlag)
  }

  async create(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
    const { data, error } = await this.client
      .from("feature_flags")
      .insert(toFeatureFlagInsert(input))
      .select()
      .single<FeatureFlagRow>()

    if (error) throw error
    return toFeatureFlag(data)
  }

  async update(id: string, input: UpdateFeatureFlagInput): Promise<FeatureFlag> {
    const { data, error } = await this.client
      .from("feature_flags")
      .update(toFeatureFlagUpdate(input))
      .eq("id", id)
      .select()
      .single<FeatureFlagRow>()

    if (error) throw error
    return toFeatureFlag(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("feature_flags")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
