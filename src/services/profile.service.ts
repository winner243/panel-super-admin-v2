import type { ProfileRepository } from "@/repositories/profile.repository"
import type { Profile } from "@/types/profile"
import { parseUpdateProfile } from "@/validators/profile"

export class ProfileService {
  constructor(private readonly profiles: ProfileRepository) {}

  async getById(id: string): Promise<Profile | null> {
    return this.profiles.getById(id)
  }

  async update(id: string, input: unknown): Promise<Profile> {
    const parsed = parseUpdateProfile(input)
    return this.profiles.update(id, parsed)
  }
}