import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { MonitorSmartphone, UserCog } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { ThemePreference } from "@/components/settings/theme-preference"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { AdminAuthService } from "@/services/auth.service"
import type { AuthUser } from "@/types/auth"

export const metadata: Metadata = {
  title: "Paramètres",
  description: "Préférences générales du panneau.",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Préférences générales et apparence de votre espace.
        </p>
      </div>

      <Suspense fallback={<SettingsLoading />}>
        <SettingsView />
      </Suspense>
    </div>
  )
}

async function SettingsView() {
  let user: AuthUser | null = null
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()
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
          <CardTitle>Impossible de charger les paramètres</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération de vos informations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">Réessayer</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const displayName = user.fullName ?? user.email
  const initial = displayName.charAt(0).toUpperCase() || "A"

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MonitorSmartphone className="size-5 text-primary" aria-hidden="true" />
              Apparence
            </CardTitle>
            <CardDescription>
              Choisissez le thème appliqué à l’ensemble du panneau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemePreference />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserCog className="size-5 text-primary" aria-hidden="true" />
              Compte
            </CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et votre profil.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/users">Mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>À propos du panneau</CardTitle>
          <CardDescription>
            Informations sur la configuration actuelle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Contrôle d’accès</p>
            <p className="text-muted-foreground">
              La sécurité reposent sur les politiques RLS appliquées à chaque
              requête côté base de données.
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Apparence</p>
            <p className="text-muted-foreground">
              Le thème est enregistré localement dans votre navigateur et
              appliqué immédiatement.
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Intégrations</p>
            <p className="text-muted-foreground">
              Aucune intégration de paiement, d’e-mail ou d’authentification
              avancée n’est configurée dans cette version.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-52 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-9 rounded-md bg-muted animate-pulse" />
          <div className="h-9 rounded-md bg-muted animate-pulse" />
          <div className="h-9 rounded-md bg-muted animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}