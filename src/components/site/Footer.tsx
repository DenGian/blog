import Link from "next/link";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <strong>Software Engineering Stagejournaal</strong>
          <p>
            Vijftien weken professionele en technische groei, gedocumenteerd
            door Ian Mondelaers.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/blog">Artikelen</Link>
          <Link href="/about">Over de stage</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/admin/login">Beheer</Link>
        </div>
      </div>
      <div className="shell copyright">
        © {new Date().getFullYear()} Ian Mondelaers. Tekst en persoonlijke media
        voorbehouden.
      </div>
    </footer>
  );
}
