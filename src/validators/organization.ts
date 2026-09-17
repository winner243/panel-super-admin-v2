import { z } from "zod"

export const organizationNameSchema = z.string().trim().min(1).max(100)

export const organizationSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
  createdBy: z.uuid(),
})

export const updateOrganizationSchema = z.object({
  name: organizationNameSchema.optional(),
  slug: organizationSlugSchema.optional(),
})

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>

export function parseCreateOrganization(input: unknown) {
  return createOrganizationSchema.parse(input)
}

export function parseUpdateOrganization(input: unknown) {
  return updateOrganizationSchema.parse(input)
}

export function parseOrganizationSlug(input: unknown) {
  return organizationSlugSchema.parse(input)
}