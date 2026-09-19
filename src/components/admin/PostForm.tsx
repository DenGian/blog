"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { PostView } from "@/domain/posts/types";
import { createSlug } from "@/domain/posts/slug";
import { RichTextEditor } from "./RichTextEditor";
import { MediaField } from "./MediaField";
type Values = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  coverImage: string;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
};
export function PostForm({
  post,
  mediaConfigured,
}: {
  post?: PostView;
  mediaConfigured: boolean;
}) {
  const router = useRouter();
  const initial = useMemo<Values>(
    () => ({
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? "<p></p>",
      tags: post?.tags.join(", ") ?? "",
      coverImage: post?.coverImage ?? "",
      status: post?.status ?? "draft",
      seoTitle: post?.seoTitle ?? "",
      seoDescription: post?.seoDescription ?? "",
    }),
    [post],
  );
  const [values, setValues] = useState(initial);
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<Record<string, string[] | undefined>>(
    {},
  );
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }
  async function submit(event: FormEvent, forcedStatus?: Values["status"]) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setIssues({});
    const status = forcedStatus ?? values.status;
    const payload = {
      ...values,
      status,
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: post?.publishedAt ?? null,
    };
    try {
      const response = await fetch(
        post ? `/api/posts/${post.id}` : "/api/posts",
        {
          method: post ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        setIssues(body.issues ?? {});
        throw new Error(body.error ?? "Opslaan is mislukt.");
      }
      setDirty(false);
      router.push("/admin");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Opslaan is mislukt.",
      );
      setBusy(false);
    }
  }
  const fieldError = (name: string) => issues[name]?.[0];
  return (
    <form
      className="admin-form post-form"
      onSubmit={(event) => submit(event)}
      noValidate
    >
      <div className="form-grid">
        <div className="field span-2">
          <label htmlFor="title">Titel</label>
          <input
            id="title"
            value={values.title}
            required
            maxLength={140}
            aria-invalid={Boolean(fieldError("title"))}
            onChange={(event) => {
              const title = event.target.value;
              update("title", title);
              if (!slugEdited)
                setValues((current) => ({
                  ...current,
                  title,
                  slug: createSlug(title),
                }));
            }}
          />
          {fieldError("title") && (
            <small className="form-error">{fieldError("title")}</small>
          )}
        </div>
        <div className="field span-2">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            value={values.slug}
            required
            maxLength={100}
            aria-invalid={Boolean(fieldError("slug"))}
            onChange={(event) => {
              setSlugEdited(true);
              update("slug", event.target.value);
            }}
          />
          {fieldError("slug") && (
            <small className="form-error">{fieldError("slug")}</small>
          )}
        </div>
        <div className="field span-2">
          <label htmlFor="excerpt">Samenvatting</label>
          <textarea
            id="excerpt"
            rows={4}
            value={values.excerpt}
            required
            maxLength={500}
            aria-invalid={Boolean(fieldError("excerpt"))}
            onChange={(event) => update("excerpt", event.target.value)}
          />
          <small>{values.excerpt.length}/500</small>
          {fieldError("excerpt") && (
            <small className="form-error">{fieldError("excerpt")}</small>
          )}
        </div>
        <div className="field span-2">
          <label>Inhoud</label>
          <RichTextEditor
            value={values.content}
            onChange={(value) => update("content", value)}
          />
          {fieldError("content") && (
            <small className="form-error">{fieldError("content")}</small>
          )}
        </div>
        <div className="span-2">
          <MediaField
            value={values.coverImage}
            onChange={(value) => update("coverImage", value)}
            configured={mediaConfigured}
          />
          {fieldError("coverImage") && (
            <small className="form-error">{fieldError("coverImage")}</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            value={values.tags}
            placeholder="docker, testing"
            onChange={(event) => update("tags", event.target.value)}
          />
          <small>Maximaal 10, gescheiden door komma’s.</small>
          {fieldError("tags") && (
            <small className="form-error">{fieldError("tags")}</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="status">Publicatiestatus</label>
          <select
            id="status"
            value={values.status}
            onChange={(event) =>
              update("status", event.target.value as Values["status"])
            }
          >
            <option value="draft">Concept</option>
            <option value="published">Gepubliceerd</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="seoTitle">SEO-titel</label>
          <input
            id="seoTitle"
            value={values.seoTitle}
            maxLength={70}
            onChange={(event) => update("seoTitle", event.target.value)}
          />
          <small>{values.seoTitle.length}/70</small>
        </div>
        <div className="field">
          <label htmlFor="seoDescription">SEO-beschrijving</label>
          <textarea
            id="seoDescription"
            rows={3}
            value={values.seoDescription}
            maxLength={160}
            onChange={(event) => update("seoDescription", event.target.value)}
          />
          <small>{values.seoDescription.length}/160</small>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        {post && (
          <a
            className="button secondary"
            href={`/admin/preview/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Voorbeeld
          </a>
        )}
        <button
          className="button secondary"
          type="button"
          disabled={busy}
          onClick={(event) => submit(event, "draft")}
        >
          Bewaar als concept
        </button>
        <button className="button primary" type="submit" disabled={busy}>
          {busy
            ? "Opslaan…"
            : values.status === "published"
              ? "Publiceer wijzigingen"
              : "Opslaan"}
        </button>
      </div>
    </form>
  );
}
