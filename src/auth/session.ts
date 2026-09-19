import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { isAuthConfigured } from "@/lib/env";

export interface AdminSession {
  authenticated: boolean;
  issuedAt: number;
}
const eightHours = 60 * 60 * 8;
function options(): SessionOptions {
  return {
    cookieName: "journal_admin",
    password: process.env.SESSION_SECRET!,
    ttl: eightHours,
    cookieOptions: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: eightHours,
    },
  };
}
export async function getAdminSession() {
  if (!isAuthConfigured()) return null;
  return getIronSession<AdminSession>(await cookies(), options());
}
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return Boolean(
    session?.authenticated &&
    typeof session.issuedAt === "number" &&
    session.issuedAt > Date.now() - eightHours * 1_000,
  );
}
