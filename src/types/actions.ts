export type ActionFieldErrors = Record<string, string | undefined>

export type ActionFormState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message?: string; fieldErrors?: ActionFieldErrors }