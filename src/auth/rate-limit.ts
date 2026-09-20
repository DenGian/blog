import "server-only";
import { validateRateLimitEnvironment } from "@/lib/env";
const localAttempts = new Map<string, number[]>();
export function resetDevelopmentRateLimits(): void {
  localAttempts.clear();
}
export type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
  configured: boolean;
};
export async function checkLoginRateLimit(
  key: string,
): Promise<RateLimitResult> {
  const env = validateRateLimitEnvironment();
  const redisUrl = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && token) {
    try {
      const response = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", `login:${key}`],
          ["EXPIRE", `login:${key}`, 900, "NX"],
        ]),
        cache: "no-store",
      });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as Array<{ result?: number }>;
      const attempts = Number(data[0]?.result ?? 999);
      return { allowed: attempts <= 8, retryAfter: 900, configured: true };
    } catch {
      return { allowed: false, retryAfter: 60, configured: true };
    }
  }
  if (process.env.NODE_ENV === "production")
    return { allowed: false, retryAfter: 60, configured: false };
  const now = Date.now();
  const recent = (localAttempts.get(key) ?? []).filter(
    (time) => time > now - 15 * 60_000,
  );
  recent.push(now);
  localAttempts.set(key, recent);
  return { allowed: recent.length <= 8, retryAfter: 900, configured: false };
}
