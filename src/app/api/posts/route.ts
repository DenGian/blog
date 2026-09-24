import { NextResponse, type NextRequest } from "next/server";
import { authorizeMutation } from "@/auth/authorize";
import { postInputSchema } from "@/domain/posts/schema";
import { createPost } from "@/data/posts";
import { isDuplicateKeyError } from "@/data/errors";
export async function POST(request: NextRequest) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  const parsed = postInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Controleer de gemarkeerde velden.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  try {
    return NextResponse.json(await createPost(parsed.data), { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error))
      return NextResponse.json(
        {
          error:
            "Deze slug is net door een andere blogpost gebruikt. Kies een andere slug.",
        },
        { status: 409 },
      );
    return NextResponse.json({ error: "Opslaan is mislukt." }, { status: 500 });
  }
}
