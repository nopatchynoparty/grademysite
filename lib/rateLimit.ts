import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function make(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// 5 free scans per IP per hour
export const scanRatelimit = make(5, "1 h");

// 10 login attempts per IP per 15 minutes
export const loginRatelimit = make(10, "15 m");
