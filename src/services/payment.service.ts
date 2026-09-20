import type { PaymentRepository } from "@/repositories/payment.repository"
import type { Payment } from "@/types/payment"
import { parseCreatePayment, parseUpdatePayment } from "@/validators/payment"

export class PaymentService {
  constructor(private readonly payments: PaymentRepository) {}

  async getById(id: string): Promise<Payment | null> {
    return this.payments.getById(id)
  }

  async listByOrganization(organizationId: string): Promise<Payment[]> {
    return this.payments.listByOrganization(organizationId)
  }

  async listByUser(userId: string): Promise<Payment[]> {
    return this.payments.listByUser(userId)
  }

  async create(input: unknown): Promise<Payment> {
    const parsed = parseCreatePayment(input)
    return this.payments.create(parsed)
  }

  async update(id: string, input: unknown): Promise<Payment> {
    const parsed = parseUpdatePayment(input)
    return this.payments.update(id, parsed)
  }

  async delete(id: string): Promise<void> {
    return this.payments.delete(id)
  }
}
