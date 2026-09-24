import Link from "next/link";
import { githubUrl, linkedinUrl } from "@/lib/social-links";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-identity">
          <strong>Stagejournaal van Ian Mondelaers</strong>
          <p>Vijftien weken software engineering bij HolonCom in 2025.</p>
        </div>
        <nav className="footer-links" aria-label="Footernavigatie">
          <Link href="/blog">Artikelen</Link>
          <Link href="/about">Over de stage</Link>
          <Link href="/contact">Contact</Link>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn-profiel van Ian Mondelaers (opent in een nieuw tabblad)"
          >
            LinkedIn ↗
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub-profiel van Ian Mondelaers (opent in een nieuw tabblad)"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
      <div className="shell copyright">© 2025 Ian Mondelaers</div>
    </footer>
  );
}
