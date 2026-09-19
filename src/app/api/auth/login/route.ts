import { compare } from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/auth/session";
import { hasValidMutationOrigin } from "@/auth/origin";
import { checkLoginRateLimit } from "@/auth/rate-limit";
import { isAuthConfigured } from "@/lib/env";
const schema = z.object({ password: z.string().min(1).max(200) }).strict();
export async function POST(request: NextRequest) {
  if (!hasValidMutationOrigin(request))
    return NextResponse.json(
      { error: "Ongeldige aanvraagbron." },
      { status: 403 },
    );
  if (!isAuthConfigured())
    return NextResponse.json(
      { error: "Admin-login is nog niet geconfigureerd." },
      { status: 503 },
    );
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const key = forwarded || "local";
  const limit = await checkLoginRateLimit(key);
  if (!limit.allowed)
    return NextResponse.json(
      {
        error: limit.configured
          ? "Te veel pogingen. Probeer later opnieuw."
          : "Productieratelimiting is niet geconfigureerd.",
      },
      {
        status: limit.configured ? 429 : 503,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success)
    return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
  const valid = await compare(
    body.data.password,
    process.env.ADMIN_PASSWORD_HASH!,
  );
  if (!valid)
    return NextResponse.json(
      { error: "Onjuiste aanmeldgegevens." },
      { status: 401 },
    );
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json(
      { error: "Admin-login is niet geconfigureerd." },
      { status: 503 },
    );
  session.authenticated = true;
  session.issuedAt = Date.now();
  await session.save();
  return NextResponse.json({ ok: true });
}
