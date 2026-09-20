import { z } from "zod";
import { createSlug } from "./slug";
import { sanitizePostHtml } from "./sanitize";
export const coverImageSchema = z
  .string()
  .trim()
  .max(2_048)
  .refine((value) => {
    if (value === "") return true;
    if (/^\/(?!\/)[^\s]*$/.test(value)) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Gebruik een lokale URL of een HTTPS-URL.");
const tagSchema = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .transform((tag) => tag.replace(/\s+/g, " "));
export const postInputSchema = z
  .object({
    title: z.string().trim().min(3).max(140),
    slug: z.string().trim().max(100).optional().default(""),
    excerpt: z.string().trim().min(10).max(500),
    content: z
      .string()
      .min(1)
      .max(250_000)
      .transform(sanitizePostHtml)
      .refine(
        (html) => html.replace(/<[^>]+>/g, "").trim().length > 0,
        "Inhoud is verplicht.",
      ),
    tags: z
      .array(tagSchema)
      .max(10)
      .transform((tags) =>
        tags.filter(
          (tag, index) =>
            tags.findIndex(
              (candidate) =>
                candidate.toLocaleLowerCase("nl") ===
                tag.toLocaleLowerCase("nl"),
            ) === index,
        ),
      ),
    coverImage: coverImageSchema.optional().default(""),
    status: z.enum(["draft", "published"]).default("draft"),
    publishedAt: z.iso.datetime().nullable().optional(),
    seoTitle: z.string().trim().max(70).optional().default(""),
    seoDescription: z.string().trim().max(160).optional().default(""),
  })
  .strict()
  .transform((input) => ({
    ...input,
    slug: createSlug(input.slug || input.title),
  }))
  .refine((input) => input.slug.length >= 3, {
    path: ["slug"],
    message: "De slug is te kort.",
  });
export type PostInput = z.infer<typeof postInputSchema>;
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000).catch(1),
  limit: z.coerce.number().int().min(1).max(24).catch(9),
  tag: z.string().trim().max(30).catch(""),
  search: z.string().trim().max(80).catch(""),
});
