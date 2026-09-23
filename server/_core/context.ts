import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse } from "cookie";
import type { User } from "../../drizzle/schema";
import { verifyCoachToken } from "../coachAuth";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  isCoach: boolean;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }
  const cookies = parse(opts.req.headers.cookie ?? "");
  const isCoach = await verifyCoachToken(cookies.coach_session);
  return { req: opts.req, res: opts.res, user, isCoach };
}
