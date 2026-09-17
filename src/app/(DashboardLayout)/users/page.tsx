import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { ProfileForm } from "@/components/users/profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseProfileRepository } from "@/repositories/profile.repository"
import { AdminAuthService } from "@/services/auth.service"
import { ProfileService } from "@/services/profile.service"
import type { AuthUser } from "@/types/auth"
import type { Profile } from "@/types/profile"

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Consultez et modifiez votre profil.",
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="text-sm text-muted-foreground">
          Consultez et modifiez les informations de votre compte.
        </p>
      </div>

      <Suspense fallback={<ProfileLoading />}>
        <ProfileView />
      </Suspense>
    </div>
  )
}

async function ProfileView() {
  let user: AuthUser | null = null
  let profile: Profile | null = null
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const profiles = new ProfileService(new SupabaseProfileRepository(supabase))
      profile = await profiles.getById(user.id)
    }
  } catch {
    failed = true
  }

  if (!user) {
    redirect("/auth/login?reason=unauthenticated")
  }

  if (failed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impossible de charger le profil</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération de vos informations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/users"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Votre profil est visible par les membres de vos organisations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm
          email={user.email}
          initialFullName={profile?.fullName ?? user.fullName}
          avatarUrl={profile?.avatarUrl ?? user.avatarUrl}
          disabled={!profile}
        />
      </CardContent>
    </Card>
  )
}

function ProfileLoading() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
        <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}