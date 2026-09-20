import { NextResponse, type NextRequest } from "next/server";
import { hasValidMutationOrigin } from "@/auth/origin";
import { getAdminSession } from "@/auth/session";
export async function POST(request: NextRequest) {
  if (!hasValidMutationOrigin(request))
    return NextResponse.json(
      { error: "Ongeldige aanvraagbron." },
      { status: 403 },
    );
  const session = await getAdminSession();
  session?.destroy();
  return NextResponse.json({ ok: true });
}
