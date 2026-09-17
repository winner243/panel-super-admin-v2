import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { Brand } from "@/components/brand"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { isSafeRedirectPath } from "@/lib/safe-redirect"
import type { AuthBanner as AuthBannerType } from "@/types/auth"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connexion à l'espace super administrateur.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string; error?: string }>
}) {
  const params = await searchParams
  const next = params.next && isSafeRedirectPath(params.next) ? params.next : undefined

  const banner: AuthBannerType | null =
    params.reason === "session_expired"
      ? {
          variant: "error",
          message: "Votre session a expiré. Veuillez vous reconnecter.",
        }
      : params.reason === "unauthenticated"
        ? {
            variant: "info",
            message: "Veuillez vous connecter pour accéder au panneau.",
          }
        : params.error
          ? {
              variant: "error",
              message: "La confirmation a échoué. Réessayez.",
            }
          : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Brand className="justify-center" />
        <Card className="w-full">
          <CardHeader>
            <CardTitle as="h1">Connexion</CardTitle>
            <CardDescription>
              Accédez à votre espace super administrateur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm initialNext={next} initialBanner={banner} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}