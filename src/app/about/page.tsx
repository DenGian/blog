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
        <p className="kicker">Over het traject</p>
        <h1>Werkplekleren als software engineer</h1>
        <p>
          Een stageperiode waarin technische uitvoering, communicatie en
          professionele zelfstandigheid samen groeiden.
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
          <h2>Waarom dit journaal bestaat</h2>
          <p>
            De vijftien artikelen leggen week voor week vast welke problemen ik
            tegenkwam, hoe ik ze benaderde en wat ik daaruit leerde tijdens mijn
            stage bij HolonCom. De teksten blijven bewust in hun oorspronkelijke
            Nederlandse vorm.
          </p>
          <h2>Meer dan een verzameling teksten</h2>
          <p>
            Deze website is tegelijk een technisch portfolio: een moderne
            Next.js-applicatie met een afgeschermd CMS, server-side validatie,
            veilige rich-textweergave en een MongoDB-datalaag die rekening houdt
            met serverless uitvoering.
          </p>
          <h2>Volledig stageverslag</h2>
          <p>
            Het PDF-verslag wordt hier aangeboden zodra het echte document als{" "}
            <code>public/internship-journal.pdf</code> is toegevoegd. Er wordt
            geen placeholderdownload getoond.
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
