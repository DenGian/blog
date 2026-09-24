import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact",
  description: "Geverifieerde profielkanalen van Ian Mondelaers.",
};
export default function ContactPage() {
  const github =
    process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/DenGian";
  const linkedin =
    process.env.NEXT_PUBLIC_LINKEDIN_URL ||
    "https://www.linkedin.com/in/ian-mondelaers/";
  return (
    <section className="section shell narrow">
      <header className="page-header">
        <p className="kicker">Contact</p>
        <h1>Laten we verder praten.</h1>
        <p>
          Voor vragen over het stagejournaal of mijn software-engineeringwerk
          kun je me bereiken via de bestaande, verifieerbare profielkanalen.
        </p>
      </header>
      <div className="contact-cards">
        <a href={linkedin} target="_blank" rel="noopener noreferrer">
          <span>Professioneel profiel</span>
          <strong>LinkedIn ↗</strong>
        </a>
        <a href={github} target="_blank" rel="noopener noreferrer">
          <span>Code en projecten</span>
          <strong>GitHub ↗</strong>
        </a>
      </div>
      <p className="privacy-note">
        Deze site gebruikt geen contactformulier en verzamelt daardoor geen
        contactgegevens. Dit voorkomt een onbeheerde mailintegratie en
        spamrisico.
      </p>
    </section>
  );
}
