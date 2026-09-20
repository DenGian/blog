import { NextResponse, type NextRequest } from "next/server";
import { authorizeMutation } from "@/auth/authorize";
import { postInputSchema } from "@/domain/posts/schema";
import { deletePost, updatePost } from "@/data/posts";
import { isDuplicateKeyError } from "@/data/errors";
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, context: Context) {
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
    const post = await updatePost((await context.params).id, parsed.data);
    return post
      ? NextResponse.json(post)
      : NextResponse.json({ error: "Artikel niet gevonden." }, { status: 404 });
  } catch (error) {
    if (isDuplicateKeyError(error))
      return NextResponse.json(
        {
          error:
            "Deze slug is net door een ander artikel gebruikt. Kies een andere slug.",
        },
        { status: 409 },
      );
    return NextResponse.json({ error: "Opslaan is mislukt." }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest, context: Context) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  try {
    return (await deletePost((await context.params).id))
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json({ error: "Artikel niet gevonden." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "Verwijderen is mislukt." },
      { status: 500 },
    );
  }
}
