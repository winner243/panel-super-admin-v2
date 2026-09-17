import { z } from "zod"

export const authEmailSchema = z.string().trim().toLowerCase().pipe(z.email())

export const loginPasswordSchema = z.string().min(1).max(256)

export const signUpPasswordSchema = z.string().min(8).max(72)

export const loginSchema = z.object({
  email: authEmailSchema,
  password: loginPasswordSchema,
})

export const signUpSchema = z.object({
  email: authEmailSchema,
  password: signUpPasswordSchema,
  fullName: z.string().trim().min(1).max(120).optional(),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>

export function parseLoginInput(input: unknown) {
  return loginSchema.safeParse(input)
}

export function parseSignUpInput(input: unknown) {
  return signUpSchema.safeParse(input)
}