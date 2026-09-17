import { z } from "zod"

export const createProfileSchema = z.object({
  id: z.uuid(),
  fullName: z.string().trim().min(1).max(120).nullish(),
  avatarUrl: z.url().nullish(),
})

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120).nullish(),
  avatarUrl: z.url().nullish(),
})

export type CreateProfileSchema = z.infer<typeof createProfileSchema>
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>

export function parseCreateProfile(input: unknown) {
  return createProfileSchema.parse(input)
}

export function parseUpdateProfile(input: unknown) {
  return updateProfileSchema.parse(input)
}