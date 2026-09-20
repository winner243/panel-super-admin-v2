import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BadgeDollarSign } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabasePaymentRepository } from "@/repositories/payment.repository"
import { AdminAuthService } from "@/services/auth.service"
import { PaymentService } from "@/services/payment.service"
import type { AuthUser } from "@/types/auth"
import type { Payment } from "@/types/payment"

export const metadata: Metadata = {
  title: "Paiements",
  description: "Consultez et gérez les paiements de vos organisations.",
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Paiements</h1>
          <p className="text-sm text-muted-foreground">
            Historique des paiements provenant des systèmes de billing connectés.
          </p>
        </div>
      </div>

      <Suspense fallback={<PaymentsLoading />}>
        <PaymentsView />
      </Suspense>
    </div>
  )
}

async function PaymentsView() {
  let user: AuthUser | null = null
  let payments: Payment[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const svc = new PaymentService(new SupabasePaymentRepository(supabase))
      payments = await svc.listByUser(user.id)
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
          <CardTitle>Impossible de charger les paiements</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération des paiements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/payments"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <BadgeDollarSign className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucun paiement</p>
            <p className="text-sm text-muted-foreground">
              Les paiements de vos organisations apparaîtront ici.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="h-full">
          <CardContent className="space-y-1 p-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">{payment.provider}</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  payment.status === "succeeded"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : payment.status === "failed"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                }`}>
                {payment.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {payment.currency}
              {payment.amount != null ? ` ${payment.amount.toFixed(2)}` : ""}
            </p>
            {payment.paymentMethodType && (
              <p className="text-xs text-muted-foreground">
                Méthode : {payment.paymentMethodType}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDate(payment.createdAt)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PaymentsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-2 p-6">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(iso))
}
