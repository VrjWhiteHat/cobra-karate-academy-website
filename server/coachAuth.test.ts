import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("auth.coachLogin", () => {
  it("accepts the configured coach credentials through the API", async () => {
    let issuedCookie = "";
    const ctx: TrpcContext = {
      user: null,
      isCoach: false,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        cookie: (_name: string, value: string) => { issuedCookie = value; },
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.coachLogin({ username: "theCPU", password: "theCPU8X" });
    expect(result.success).toBe(true);
    expect(issuedCookie.length).toBeGreaterThan(20);
  });
});
