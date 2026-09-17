import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import { SupabaseAuditLogRepository } from "@/repositories/audit-log.repository"
import { AuditLogService } from "@/services/audit-log.service"
import type { CreateAuditLogInput } from "@/types/audit-log"

/**
 * Écriture d'un événement du journal d'audit en best-effort.
 * La sécurité de l'insertion (acteur = utilisateur courant, isolation
 * organisationnelle) est garantie par RLS. Une erreur d'écriture ne doit pas
 * faire échouer l'action métier principale : elle est simplement journalisée.
 */
export async function recordAuditLog(
  supabase: SupabaseClient<Database>,
  input: CreateAuditLogInput,
): Promise<void> {
  if (!input.actorId) return

  try {
    const service = new AuditLogService(new SupabaseAuditLogRepository(supabase))
    await service.create({
      ...input,
      status: input.status ?? "success",
    })
  } catch (error) {
    // Journalisation best-effort : l'erreur SQL est structurée et ne transmet
    // aucune valeur de metadata sensible.
    console.error("Écriture du journal d'audit ignorée (best-effort).", error)
  }
}