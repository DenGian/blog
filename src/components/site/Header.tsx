import Link from "next/link";
const links = [
  { href: "/blog", label: "Artikelen" },
  { href: "/about", label: "Over de stage" },
  { href: "/contact", label: "Contact" },
];
export function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Naar inhoud
      </a>
      <div className="shell nav">
        <Link className="brand" href="/" aria-label="Stagejournaal home">
          <span className="brand-mark" aria-hidden>
            IM
          </span>
          <span>
            Stagejournaal<small>Software engineering</small>
          </span>
        </Link>
        <nav aria-label="Hoofdnavigatie">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
