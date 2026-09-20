import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ListChecks } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseBackgroundJobRepository } from "@/repositories/background-job.repository"
import { AdminAuthService } from "@/services/auth.service"
import { BackgroundJobService } from "@/services/background-job.service"
import type { AuthUser } from "@/types/auth"
import type { BackgroundJob } from "@/types/background-job"

export const metadata: Metadata = {
  title: "Tâches d'arrière-plan",
  description: "Consultez et gérez les tâches d'arrière-plan de vos organisations.",
}

export default function BackgroundJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tâches d&apos;arrière-plan</h1>
          <p className="text-sm text-muted-foreground">
            Supervision des jobs asynchrones et tâches planifiées.
          </p>
        </div>
      </div>

      <Suspense fallback={<BackgroundJobsLoading />}>
        <BackgroundJobsView />
      </Suspense>
    </div>
  )
}

async function BackgroundJobsView() {
  let user: AuthUser | null = null
  let jobs: BackgroundJob[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const svc = new BackgroundJobService(
        new SupabaseBackgroundJobRepository(supabase)
      )
      jobs = await svc.listByUser(user.id)
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
          <CardTitle>Impossible de charger les tâches</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération des tâches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/jobs"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <ListChecks className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucune tâche</p>
            <p className="text-sm text-muted-foreground">
              Les tâches d&apos;arrière-plan de vos organisations apparaîtront ici.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job.id} className="h-full">
          <CardContent className="space-y-1 p-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">{job.type}</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  job.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : job.status === "failed"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : job.status === "running"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                }`}>
                {job.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 ${
                  job.priority === "critical"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : job.priority === "high"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                }`}>
                {job.priority}
              </span>
              <span>
                {job.attempts}/{job.maxAttempts} tentative{job.maxAttempts > 1 ? "s" : ""}
              </span>
            </div>
            {job.lastError && (
              <p className="truncate text-xs text-destructive">{job.lastError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Créé le {new Date(job.createdAt).toLocaleString("fr-FR")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BackgroundJobsLoading() {
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
