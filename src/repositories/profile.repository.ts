import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type { Profile, UpdateProfileInput } from "@/types/profile"
import { toProfile, toProfileUpdate, type ProfileRow } from "@/adapters/profile"

export interface ProfileRepository {
  getById(id: string): Promise<Profile | null>
  update(id: string, input: UpdateProfileInput): Promise<Profile>
}

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", id)
      .maybeSingle<ProfileRow>()

    if (error) throw error
    return data ? toProfile(data) : null
  }

  async update(id: string, input: UpdateProfileInput): Promise<Profile> {
    const { data, error } = await this.client
      .from("profiles")
      .update(toProfileUpdate(input))
      .eq("id", id)
      .select("id, full_name, avatar_url")
      .single<ProfileRow>()

    if (error) throw error
    return toProfile(data)
  }
}