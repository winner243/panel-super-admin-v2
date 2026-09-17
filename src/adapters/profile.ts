import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateProfileInput,
  Profile,
  UpdateProfileInput,
} from "@/types/profile"

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
  }
}

export function toProfileInsert(input: CreateProfileInput): ProfileInsert {
  return {
    id: input.id,
    full_name: input.fullName ?? null,
    avatar_url: input.avatarUrl ?? null,
  }
}

export function toProfileUpdate(input: UpdateProfileInput): ProfileUpdate {
  return {
    ...(input.fullName !== undefined && { full_name: input.fullName }),
    ...(input.avatarUrl !== undefined && { avatar_url: input.avatarUrl }),
  }
}