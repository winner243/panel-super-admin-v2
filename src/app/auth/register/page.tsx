import type { Metadata } from "next"
import { SignUpForm } from "@/components/auth/signup-form"
import { Brand } from "@/components/brand"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Inscription",
  description: "Création d'un compte super administrateur.",
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Brand className="justify-center" />
        <Card className="w-full">
          <CardHeader>
            <CardTitle as="h1">Inscription</CardTitle>
            <CardDescription>
              Créez un compte pour accéder au panneau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}