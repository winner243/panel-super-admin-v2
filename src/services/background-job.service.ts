import type { BackgroundJobRepository } from "@/repositories/background-job.repository"
import type { BackgroundJob } from "@/types/background-job"
import {
  parseCreateBackgroundJob,
  parseUpdateBackgroundJob,
} from "@/validators/background-job"

export class BackgroundJobService {
  constructor(private readonly jobs: BackgroundJobRepository) {}

  async getById(id: string): Promise<BackgroundJob | null> {
    return this.jobs.getById(id)
  }

  async listByOrganization(organizationId: string): Promise<BackgroundJob[]> {
    return this.jobs.listByOrganization(organizationId)
  }

  async listByUser(userId: string): Promise<BackgroundJob[]> {
    return this.jobs.listByUser(userId)
  }

  async create(input: unknown): Promise<BackgroundJob> {
    const parsed = parseCreateBackgroundJob(input)
    return this.jobs.create(parsed)
  }

  async update(id: string, input: unknown): Promise<BackgroundJob> {
    const parsed = parseUpdateBackgroundJob(input)
    return this.jobs.update(id, parsed)
  }

  async delete(id: string): Promise<void> {
    return this.jobs.delete(id)
  }
}
