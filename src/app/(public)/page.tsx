import Link from "next/link";
import { PostCard } from "@/components/posts/PostCard";
import { listPublishedPosts } from "@/data/posts";
import type { PostView } from "@/domain/posts/types";
import { logOperationalError } from "@/lib/operational-log";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  let posts: PostView[] = [];
  let unavailable = false;
  try {
    posts = (await listPublishedPosts({ limit: 3 })).posts;
  } catch (error) {
    logOperationalError("homepage post retrieval", error);
    unavailable = true;
  }
  return (
    <>
      <section className="hero shell">
        <div className="hero-grid">
          <div className="hero-intro">
            <p className="kicker">De blog van Ian Mondelaers</p>
            <h1>Vijftien weken leren, bouwen en terugkijken.</h1>
            <p className="hero-copy">
              Tijdens mijn stage als software engineer bij HolonCom schreef ik
              elke week over wat ik bouwde, wat lastig was en wat ik leerde.
              Hier vind je de blogposts van die vijftien weken.
            </p>
            <div className="actions">
              <Link className="button primary" href="/blog">
                Lees de blog
              </Link>
              <Link className="text-link" href="/about">
                Meer over mijn stage →
              </Link>
            </div>
          </div>
          <p className="hero-byline">
            Ian Mondelaers <span aria-hidden="true">·</span> Software engineer
            bij HolonCom <span aria-hidden="true">·</span> 2025
          </p>
        </div>
      </section>
      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="kicker">Uit de blog</p>
            <h2>Recente weken</h2>
          </div>
          <Link href="/blog">Alle blogposts →</Link>
        </div>
        {posts.length ? (
          <div className="post-grid">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} featured={index === 0} />
            ))}
          </div>
        ) : unavailable ? (
          <div className="empty-state">
            <h2>De blogposts zijn tijdelijk niet beschikbaar.</h2>
            <p>
              De blog kan momenteel niet worden geladen. Probeer het later
              opnieuw.
            </p>
          </div>
        ) : (
          <div className="empty-state">
            <h2>Er zijn nog geen blogposts gepubliceerd.</h2>
            <p>Kom later terug voor de weekverslagen.</p>
          </div>
        )}
      </section>
    </>
  );
}
