import "server-only";
import { Types, type QueryFilter } from "mongoose";
import { connectDatabase } from "@/lib/mongodb";
import { PostModel, type PostDocument } from "@/models/Post";
import { calculateReadingTime } from "@/domain/posts/reading-time";
import { escapeRegex, normalizeSearch } from "@/domain/posts/search";
import { sanitizePostHtml } from "@/domain/posts/sanitize";
import { slugWithSuffix } from "@/domain/posts/slug";
import type { PostInput } from "@/domain/posts/schema";
import type { PostPageResult, PostView } from "@/domain/posts/types";
import { legacyCoverForSlug } from "@/domain/posts/legacy-covers";

const publicFilter = {
  $or: [{ status: "published" }, { status: { $exists: false } }],
} satisfies QueryFilter<PostDocument>;
type LeanPost = Record<string, unknown> & {
  _id: { toString(): string };
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags?: string[];
  coverImage?: string;
  status?: string;
  date?: Date;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  readingTime?: number;
  seoTitle?: string;
  seoDescription?: string;
};
function iso(value: unknown, fallback = new Date(0)): string {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : fallback;
  return date.toISOString();
}
function toView(post: LeanPost): PostView {
  const legacy = post.status === undefined;
  const date = post.publishedAt ?? post.date ?? post.createdAt ?? new Date(0);
  return {
    id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    content: sanitizePostHtml(post.content),
    excerpt: post.excerpt,
    tags: post.tags ?? [],
    coverImage: legacyCoverForSlug(post.slug) ?? post.coverImage ?? null,
    status: legacy
      ? "published"
      : post.status === "published"
        ? "published"
        : "draft",
    publishedAt: post.status === "draft" ? null : iso(date),
    createdAt: iso(post.createdAt, date),
    updatedAt: iso(post.updatedAt, date),
    readingTime: post.readingTime ?? calculateReadingTime(post.content),
    seoTitle: post.seoTitle || null,
    seoDescription: post.seoDescription || null,
    legacy,
  };
}
function sortDate() {
  return {
    publishedAt: -1 as const,
    date: -1 as const,
    createdAt: -1 as const,
    _id: -1 as const,
  };
}
export async function listAllPublishedPosts(): Promise<PostView[]> {
  await connectDatabase();
  const batchSize = 100;
  const maximum = 5_000;
  const output: PostView[] = [];
  for (let offset = 0; offset < maximum; offset += batchSize) {
    const batch = await PostModel.find(publicFilter)
      .sort(sortDate())
      .skip(offset)
      .limit(batchSize)
      .lean();
    output.push(...(batch as unknown as LeanPost[]).map(toView));
    if (batch.length < batchSize) return output;
  }
  throw new Error("Published post safety limit exceeded.");
}

export async function listPublishedPosts(
  input: { page?: number; limit?: number; tag?: string; search?: string } = {},
): Promise<PostPageResult> {
  await connectDatabase();
  const page = Math.max(1, Math.min(input.page ?? 1, 1_000));
  const limit = Math.max(1, Math.min(input.limit ?? 9, 24));
  const filter: QueryFilter<PostDocument> = { ...publicFilter };
  if (input.tag)
    filter.tags = new RegExp(`^${escapeRegex(input.tag.slice(0, 30))}$`, "i");
  const search = normalizeSearch(input.search);
  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    filter.$and = [
      {
        $or: [
          { title: expression },
          { excerpt: expression },
          { tags: expression },
        ],
      },
    ];
  }
  const [items, total] = await Promise.all([
    PostModel.find(filter)
      .sort(sortDate())
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PostModel.countDocuments(filter),
  ]);
  return {
    posts: (items as unknown as LeanPost[]).map(toView),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
export async function listAllPosts(): Promise<PostView[]> {
  await connectDatabase();
  const posts = await PostModel.find()
    .sort({ updatedAt: -1, date: -1 })
    .limit(200)
    .lean();
  return (posts as unknown as LeanPost[]).map(toView);
}
export async function getPublishedPost(slug: string): Promise<PostView | null> {
  if (!/^[a-z0-9-]{3,100}$/.test(slug)) return null;
  await connectDatabase();
  const post = await PostModel.findOne({ slug, ...publicFilter }).lean();
  return post ? toView(post as unknown as LeanPost) : null;
}
export async function getPostById(id: string): Promise<PostView | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDatabase();
  const post = await PostModel.findById(id).lean();
  return post ? toView(post as unknown as LeanPost) : null;
}
export async function getAdjacentPosts(
  post: PostView,
): Promise<{ previous: PostView | null; next: PostView | null }> {
  const ordered = await listAllPublishedPosts();
  const index = ordered.findIndex((candidate) => candidate.id === post.id);
  return {
    previous: index >= 0 ? (ordered[index + 1] ?? null) : null,
    next: index > 0 ? (ordered[index - 1] ?? null) : null,
  };
}
export async function getTags(): Promise<string[]> {
  await connectDatabase();
  const tags = await PostModel.distinct("tags", publicFilter);
  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .sort((a, b) => a.localeCompare(b, "nl"));
}
async function uniqueSlug(
  requested: string,
  excludingId?: string,
): Promise<string> {
  let candidate = requested;
  let suffix = 2;
  while (
    await PostModel.exists({
      slug: candidate,
      ...(excludingId ? { _id: { $ne: excludingId } } : {}),
    })
  )
    candidate = slugWithSuffix(requested, suffix++);
  return candidate;
}
export async function createPost(input: PostInput): Promise<PostView> {
  await connectDatabase();
  const slug = await uniqueSlug(input.slug);
  const now = new Date();
  const post = await PostModel.create({
    ...input,
    slug,
    coverImage: input.coverImage || undefined,
    status: input.status,
    publishedAt:
      input.status === "published"
        ? input.publishedAt
          ? new Date(input.publishedAt)
          : now
        : undefined,
    date: input.status === "published" ? now : undefined,
    readingTime: calculateReadingTime(input.content),
    author: { name: "Ian Mondelaers", image: "/profile.png" },
    schemaVersion: 2,
  });
  return toView(post.toObject() as unknown as LeanPost);
}
export async function updatePost(
  id: string,
  input: PostInput,
): Promise<PostView | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDatabase();
  const existing = await PostModel.findById(id);
  if (!existing) return null;
  const wasPublished =
    existing.status === "published" || existing.status === undefined;
  const slug = await uniqueSlug(input.slug, id);
  const publishedAt =
    input.status === "published"
      ? input.publishedAt
        ? new Date(input.publishedAt)
        : wasPublished
          ? (existing.publishedAt ?? existing.date)
          : new Date()
      : undefined;
  existing.set({
    ...input,
    slug,
    coverImage: input.coverImage || undefined,
    publishedAt,
    readingTime: calculateReadingTime(input.content),
    schemaVersion: 2,
  });
  await existing.save();
  return toView(existing.toObject() as unknown as LeanPost);
}
export async function deletePost(id: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(id)) return false;
  await connectDatabase();
  return Boolean(await PostModel.findByIdAndDelete(id));
}
