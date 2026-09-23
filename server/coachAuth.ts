import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

const encoder = new TextEncoder();
const secret = () => encoder.encode(ENV.cookieSecret || "development-only-secret");

export function verifyCoachCredentials(username: string, password: string) {
  return Boolean(username && password && username === process.env.COACH_ADMIN_USERNAME && password === process.env.COACH_ADMIN_PASSWORD);
}

export async function createCoachToken() {
  return new SignJWT({ role: "coach" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret());
}

export async function verifyCoachToken(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}
