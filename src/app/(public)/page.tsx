import Link from "next/link";
import Image from "next/image";
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
            <p className="kicker">Een stagejournaal van Ian Mondelaers</p>
            <h1>Vijftien weken leren, bouwen en terugkijken.</h1>
            <p className="hero-copy">
              Tijdens mijn software-engineeringstage bij HolonCom schreef ik
              elke week op waar ik aan werkte, wat lastig was en wat ik leerde.
              Hier staan die vijftien weken bij elkaar.
            </p>
            <div className="actions">
              <Link className="button primary" href="/blog">
                Lees het journaal
              </Link>
              <Link className="text-link" href="/about">
                Meer over mijn stage →
              </Link>
            </div>
          </div>
          <aside className="hero-author">
            <Image
              src="/profile-image.jpg"
              alt="Ian Mondelaers"
              width={541}
              height={1040}
              sizes="(max-width: 760px) 92px, 148px"
              priority
            />
            <div>
              <strong>Ian Mondelaers</strong>
              <span>Software engineering · HolonCom</span>
            </div>
          </aside>
        </div>
      </section>
      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="kicker">Uit het journaal</p>
            <h2>Recente weken</h2>
          </div>
          <Link href="/blog">Alle artikelen →</Link>
        </div>
        {posts.length ? (
          <div className="post-grid">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} featured={index === 0} />
            ))}
          </div>
        ) : unavailable ? (
          <div className="empty-state">
            <h2>De artikelen zijn tijdelijk niet beschikbaar.</h2>
            <p>
              Het journaal kan momenteel niet worden geladen. Probeer het later
              opnieuw.
            </p>
          </div>
        ) : (
          <div className="empty-state">
            <h2>Er zijn nog geen artikelen gepubliceerd.</h2>
            <p>Kom later terug voor de weekverslagen.</p>
          </div>
        )}
      </section>
    </>
  );
}
