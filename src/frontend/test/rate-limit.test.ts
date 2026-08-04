import { describe, expect, it } from "vitest";
import { FixedWindowRateLimiter } from "@/lib/server/rate-limit";

describe("fixed-window rate limiter", () => {
  it("blocks after the limit and resets after the window", () => {
    let now = 1_000;
    const limiter = new FixedWindowRateLimiter(2, 10_000, () => now);
    expect(limiter.consume("client").allowed).toBe(true);
    expect(limiter.consume("client").allowed).toBe(true);
    const blocked = limiter.consume("client");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(10);
    now = 11_001;
    expect(limiter.consume("client").allowed).toBe(true);
  });
});
