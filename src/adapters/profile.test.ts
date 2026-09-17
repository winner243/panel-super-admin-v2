import { describe, expect, it } from "vitest"
import { toProfile, type ProfileRow } from "./profile"

const row: ProfileRow = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Marie Dupont",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
}

describe("toProfile", () => {
  it("mappe une ligne Supabase vers le domaine (profil minimal)", () => {
    expect(toProfile(row)).toEqual({
      id: "00000000-0000-0000-0000-000000000001",
      fullName: "Marie Dupont",
      avatarUrl: null,
    })
  })

  it("n’expose pas les colonnes réservées au profil minimal", () => {
    const mapped = toProfile(row)
    expect("createdAt" in mapped).toBe(false)
    expect("updatedAt" in mapped).toBe(false)
  })
})