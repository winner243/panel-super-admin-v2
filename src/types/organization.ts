export interface Organization {
  id: string
  name: string
  slug: string
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export type CreateOrganizationInput = Pick<Organization, "name" | "slug"> & {
  createdBy: string
}

export type UpdateOrganizationInput = Partial<Pick<Organization, "name" | "slug">>