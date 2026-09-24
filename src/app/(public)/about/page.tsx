import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Over de stage",
  description:
    "Context bij het software-engineeringstagejournaal van Ian Mondelaers.",
};
export default function AboutPage() {
  return (
    <section className="section shell">
      <header className="page-header">
        <p className="kicker">Over mij en dit journaal</p>
        <h1>Ik ben Ian.</h1>
        <p>
          Ik liep vijftien weken stage als software engineer bij HolonCom. Dit
          journaal is mijn verslag van die periode.
        </p>
      </header>
      <div className="about-grid">
        <div className="portrait">
          <Image
            src="/profile-image.jpg"
            alt="Portret van Ian Mondelaers"
            width={541}
            height={1040}
            sizes="(max-width: 760px) 80vw, 32vw"
            priority
          />
        </div>
        <div className="prose-static">
          <h2>Week na week</h2>
          <p>
            Ik schreef op wat ik bouwde, waar ik vastliep en hoe ik verderkwam.
            Samen laten de vijftien oorspronkelijke Nederlandstalige artikelen
            zien hoe mijn werk en mijn manier van denken veranderden.
          </p>
          <h2>Waarom ik ze deel</h2>
          <p>
            Een stage bestaat uit meer dan het eindresultaat. De vragen,
            afwegingen en kleine doorbraken onderweg verdienen ook een plek.
            Daarom staan de verslagen hier als één doorlopend verhaal.
          </p>
          <div className="actions">
            <Link className="button primary" href="/blog">
              Bekijk de artikelen
            </Link>
            <Link className="button secondary" href="/contact">
              Neem contact op
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
