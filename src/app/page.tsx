import Link from "next/link";
import { PostCard } from "@/components/posts/PostCard";
import { listPublishedPosts } from "@/data/posts";
import type { PostView } from "@/domain/posts/types";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  let posts: PostView[] = [];
  try {
    posts = (await listPublishedPosts({ limit: 4 })).posts;
  } catch {
    posts = [];
  }
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="kicker">Werkplekleren · 15 weken · 2025</p>
            <h1>Groeien door software te bouwen die ertoe doet.</h1>
            <p className="hero-copy">
              Dit stagejournaal bundelt mijn technische keuzes, moeilijke bugs,
              samenwerkingen en reflecties tijdens een software-engineeringstage
              bij HolonCom.
            </p>
            <div className="actions">
              <Link className="button primary" href="/blog">
                Lees het journaal
              </Link>
              <Link className="button secondary" href="/about">
                Context en architectuur
              </Link>
            </div>
          </div>
          <aside className="hero-panel" aria-label="Journaal in cijfers">
            <div>
              <strong>15</strong>
              <span>weekverslagen</span>
            </div>
            <div>
              <strong>1</strong>
              <span>volledige stageperiode</span>
            </div>
            <div>
              <strong>NL</strong>
              <span>authentieke reflecties</span>
            </div>
          </aside>
        </div>
      </section>
      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="kicker">Recente hoofdstukken</p>
            <h2>Van code naar professioneel inzicht</h2>
          </div>
          <Link href="/blog">Alle artikelen →</Link>
        </div>
        {posts.length ? (
          <div className="post-grid">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} featured={index === 0} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>De artikelen zijn tijdelijk niet beschikbaar.</h2>
            <p>
              Probeer het later opnieuw. De publieke site blijft bruikbaar
              zonder optionele integraties.
            </p>
          </div>
        )}
      </section>
      <section className="statement">
        <div className="shell narrow">
          <p className="kicker">For international reviewers</p>
          <h2>
            A real internship record, presented as a production-minded
            full-stack application.
          </h2>
          <p>
            The Dutch articles remain unaltered. The surrounding platform
            demonstrates secure content management, typed server boundaries,
            accessible presentation and deployment-aware engineering.
          </p>
        </div>
      </section>
    </>
  );
}
