import { headers } from "next/headers"

export async function getClientIpKey(prefix: string): Promise<string> {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get("x-forwarded-for")
  const rawIp = forwarded ?? requestHeaders.get("x-real-ip") ?? "unknown"
  const ip = rawIp.split(",")[0]?.trim() || "unknown"
  return `${prefix}-${ip}`
}