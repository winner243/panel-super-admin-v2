export interface Profile {
  id: string
  fullName: string | null
  avatarUrl: string | null
}

export type CreateProfileInput = Pick<Profile, "id"> &
  Partial<Pick<Profile, "fullName" | "avatarUrl">>

export type UpdateProfileInput = Partial<Pick<Profile, "fullName" | "avatarUrl">>