import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Over de stage",
  description:
    "Over Ians stage als software engineer bij HolonCom in 2025 en de blogposts over zijn vijftien weken daar.",
};

export default function AboutPage() {
  return (
    <section className="section shell about-page">
      <header className="page-header">
        <p className="kicker">Over de stage</p>
        <h1>Vijftien weken software engineering bij HolonCom</h1>
        <p>
          Ik ben Ian Mondelaers. Tijdens mijn stage als software engineer bij
          HolonCom in 2025 schreef ik vijftien weken lang over wat ik bouwde en
          leerde.
        </p>
        <p>
          Die verslagen volgen mijn stage van de eerste opdrachten tot de
          afronding. Ze laten zien hoe het werk in de praktijk verliep, ook als
          iets niet meteen lukte.
        </p>
      </header>

      <dl className="stage-facts" aria-label="Stage in het kort">
        <div>
          <dt>Periode</dt>
          <dd>2025</dd>
        </div>
        <div>
          <dt>Duur</dt>
          <dd>15 weken</dd>
        </div>
        <div>
          <dt>Rol</dt>
          <dd>Software engineer</dd>
        </div>
        <div>
          <dt>Organisatie</dt>
          <dd>HolonCom</dd>
        </div>
      </dl>

      <div className="about-sections">
        <section>
          <h2>Het werk</h2>
          <p>
            Ik werkte onder meer met Docker, CI/CD en NuGet-pakketten. In de
            weekverslagen komen ook testen, refactoring, deployments, debugging
            en werk voor klanten aan bod. Vaak ging het om uitzoeken waarom iets
            niet werkte, een oplossing proberen en daarna verder bouwen.
          </p>
        </section>
        <section>
          <h2>Deze blog</h2>
          <p>
            Ik schreef de blogposts tijdens mijn stage, week na week. Samen
            geven ze een eerlijk beeld van mijn technische werk en van wat ik in
            die vijftien weken heb geleerd.
          </p>
        </section>
      </div>

      <div className="actions about-actions">
        <Link className="button primary" href="/blog">
          Bekijk de blogposts
        </Link>
        <Link className="button secondary" href="/contact">
          Neem contact op
        </Link>
      </div>
    </section>
  );
}
