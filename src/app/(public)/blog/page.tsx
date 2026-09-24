import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/posts/PostCard";
import { getTags, listPublishedPosts } from "@/data/posts";
import { listQuerySchema } from "@/domain/posts/schema";
import type { PostPageResult } from "@/domain/posts/types";
import { logOperationalError } from "@/lib/operational-log";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blogposts",
  description:
    "Vijftien blogposts over Ians werk en technische uitdagingen als software engineer bij HolonCom in 2025.",
};
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = listQuerySchema.parse({
    page: raw.page,
    limit: 9,
    tag: raw.tag,
    search: raw.search,
  });
  let result: PostPageResult = {
    posts: [],
    total: 0,
    page: query.page,
    totalPages: 1,
  };
  let tags: string[] = [];
  let unavailable = false;
  try {
    [result, tags] = await Promise.all([listPublishedPosts(query), getTags()]);
  } catch (error) {
    logOperationalError("blog index retrieval", error);
    unavailable = true;
  }
  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.tag) params.set("tag", query.tag);
    if (page > 1) params.set("page", String(page));
    return `/blog${params.size ? `?${params}` : ""}`;
  };
  return (
    <section className="section shell">
      <header className="page-header">
        <p className="kicker">Vijftien weken bij HolonCom</p>
        <h1>De blog</h1>
        <p>
          Vijftien weekverslagen over de projecten, technische uitdagingen en
          lessen uit mijn stage bij HolonCom.
        </p>
      </header>
      <form className="search" action="/blog" role="search">
        <label htmlFor="search">Zoek in titels, samenvattingen en tags</label>
        <div>
          <input
            id="search"
            name="search"
            type="search"
            defaultValue={query.search}
            maxLength={80}
            placeholder="Bijvoorbeeld Docker of refactoring"
          />
          {query.tag && <input type="hidden" name="tag" value={query.tag} />}
          <button className="button primary" type="submit">
            Zoeken
          </button>
        </div>
      </form>
      <nav className="filters" aria-label="Populaire onderwerpen">
        <Link
          className={!query.tag ? "active" : ""}
          href={
            query.search
              ? `/blog?search=${encodeURIComponent(query.search)}`
              : "/blog"
          }
        >
          Alles
        </Link>
        {tags.slice(0, 8).map((tag) => (
          <Link
            key={tag}
            className={query.tag === tag ? "active" : ""}
            href={`/blog?tag=${encodeURIComponent(tag)}${query.search ? `&search=${encodeURIComponent(query.search)}` : ""}`}
          >
            {tag}
          </Link>
        ))}
      </nav>
      {tags.length > 8 && (
        <details className="all-filters">
          <summary>Alle onderwerpen ({tags.length})</summary>
          <nav className="filters" aria-label="Alle onderwerpen">
            {tags.map((tag) => (
              <Link
                key={tag}
                className={query.tag === tag ? "active" : ""}
                href={`/blog?tag=${encodeURIComponent(tag)}${query.search ? `&search=${encodeURIComponent(query.search)}` : ""}`}
              >
                {tag}
              </Link>
            ))}
          </nav>
        </details>
      )}
      {unavailable ? (
        <div className="empty-state" role="status">
          <h2>De blog is tijdelijk niet beschikbaar.</h2>
          <p>
            De blogposts konden niet worden geladen. Probeer het later opnieuw.
          </p>
        </div>
      ) : result.posts.length ? (
        <>
          <p className="result-count">
            {result.total} {result.total === 1 ? "blogpost" : "blogposts"}
          </p>
          <div className="post-list">
            {result.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <nav className="pagination" aria-label="Paginering">
            {result.page <= 1 ? (
              <span aria-disabled="true">← Vorige</span>
            ) : (
              <Link href={hrefFor(result.page - 1)}>← Vorige</Link>
            )}
            <span>
              Pagina {result.page} van {result.totalPages}
            </span>
            {result.page >= result.totalPages ? (
              <span aria-disabled="true">Volgende →</span>
            ) : (
              <Link href={hrefFor(result.page + 1)}>Volgende →</Link>
            )}
          </nav>
        </>
      ) : (
        <div className="empty-state">
          <h2>
            {query.search || query.tag
              ? "Geen blogposts gevonden"
              : "Er zijn nog geen blogposts gepubliceerd"}
          </h2>
          <p>
            {query.search || query.tag
              ? "Pas je zoekterm of filter aan."
              : "Kom later terug voor de weekverslagen."}
          </p>
          <Link className="button secondary" href="/blog">
            Wis filters
          </Link>
        </div>
      )}
    </section>
  );
}
