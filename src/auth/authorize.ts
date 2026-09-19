import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "./session";
import { hasValidMutationOrigin } from "./origin";
export async function authorizeMutation(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!hasValidMutationOrigin(request))
    return NextResponse.json(
      { error: "Ongeldige aanvraagbron." },
      { status: 403 },
    );
  if (!(await isAdmin()))
    return NextResponse.json(
      { error: "Authenticatie vereist." },
      { status: 401 },
    );
  return null;
}
