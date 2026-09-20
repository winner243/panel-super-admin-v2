import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Bell } from "lucide-react"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { SupabaseNotificationRepository } from "@/repositories/notification.repository"
import { AdminAuthService } from "@/services/auth.service"
import { NotificationService } from "@/services/notification.service"
import type { AuthUser } from "@/types/auth"
import type { Notification } from "@/types/notification"

export const metadata: Metadata = {
  title: "Notifications",
  description: "Consultez et gérez vos notifications.",
}

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Historique des notifications provenant des systèmes connectés.
          </p>
        </div>
      </div>

      <Suspense fallback={<NotificationsLoading />}>
        <NotificationsView />
      </Suspense>
    </div>
  )
}

async function NotificationsView() {
  let user: AuthUser | null = null
  let notifications: Notification[] = []
  let failed = false

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    user = await auth.getUser()

    if (user) {
      const svc = new NotificationService(new SupabaseNotificationRepository(supabase))
      notifications = await svc.listByRecipient(user.id)
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
          <CardTitle>Impossible de charger les notifications</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la récupération des notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/notifications"
            className="text-sm font-medium text-primary underline underline-offset-4">
            Réessayer
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Bell className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Aucune notification</p>
            <p className="text-sm text-muted-foreground">
              Vos notifications apparaîtront ici.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={notification.status === "unread" ? "border-primary/50" : ""}>
          <CardContent className="flex items-start justify-between p-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{notification.title}</p>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                  {notification.type}
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                  {notification.channel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(notification.createdAt)}
                {notification.readAt && ` · Lu le ${formatDate(notification.readAt)}`}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                notification.status === "unread"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  : notification.status === "read"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
              }`}>
              {notification.status}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function NotificationsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-2 p-6">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
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
