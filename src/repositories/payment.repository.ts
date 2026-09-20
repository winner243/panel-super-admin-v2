import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreatePaymentInput,
  Payment,
  UpdatePaymentInput,
} from "@/types/payment"
import {
  toPayment,
  toPaymentInsert,
  toPaymentUpdate,
  type PaymentRow,
} from "@/adapters/payment"

export interface PaymentRepository {
  getById(id: string): Promise<Payment | null>
  listByOrganization(organizationId: string): Promise<Payment[]>
  listByUser(userId: string): Promise<Payment[]>
  create(input: CreatePaymentInput): Promise<Payment>
  update(id: string, input: UpdatePaymentInput): Promise<Payment>
  delete(id: string): Promise<void>
}

export class SupabasePaymentRepository implements PaymentRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<Payment | null> {
    const { data, error } = await this.client
      .from("payments")
      .select("*")
      .eq("id", id)
      .maybeSingle<PaymentRow>()

    if (error) throw error
    return data ? toPayment(data) : null
  }

  async listByOrganization(organizationId: string): Promise<Payment[]> {
    const { data, error } = await this.client
      .from("payments")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .returns<PaymentRow[]>()

    if (error) throw error
    return data.map(toPayment)
  }

  async listByUser(userId: string): Promise<Payment[]> {
    const { data, error } = await this.client
      .from("payments")
      .select("*, organization_members!inner(user_id)")
      .eq("organization_members.user_id", userId)
      .order("created_at", { ascending: false })
      .returns<PaymentRow[]>()

    if (error) throw error
    return data.map(toPayment)
  }

  async create(input: CreatePaymentInput): Promise<Payment> {
    const { data, error } = await this.client
      .from("payments")
      .insert(toPaymentInsert(input))
      .select()
      .single<PaymentRow>()

    if (error) throw error
    return toPayment(data)
  }

  async update(id: string, input: UpdatePaymentInput): Promise<Payment> {
    const { data, error } = await this.client
      .from("payments")
      .update(toPaymentUpdate(input))
      .eq("id", id)
      .select()
      .single<PaymentRow>()

    if (error) throw error
    return toPayment(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("payments")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
