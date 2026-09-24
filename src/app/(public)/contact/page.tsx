import type { Metadata } from "next";
import { githubUrl, linkedinUrl } from "@/lib/social-links";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Neem contact op met Ian Mondelaers via LinkedIn of bekijk zijn projecten op GitHub.",
};

export default function ContactPage() {
  return (
    <section className="section shell narrow contact-page">
      <header className="page-header">
        <p className="kicker">Contact</p>
        <h1>Neem gerust contact op.</h1>
        <p>
          Wil je iets vragen over mijn stage, een blogpost of mijn werk als
          software engineer? Je vindt me op LinkedIn en GitHub.
        </p>
      </header>
      <div className="contact-cards">
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bekijk mijn LinkedIn-profiel (opent in een nieuw tabblad)"
        >
          <strong>LinkedIn</strong>
          <span>Stuur me een bericht of maak verbinding.</span>
          <span className="contact-action">Bekijk mijn profiel ↗</span>
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bekijk mijn GitHub-projecten (opent in een nieuw tabblad)"
        >
          <strong>GitHub</strong>
          <span>Bekijk mijn projecten en openbare code.</span>
          <span className="contact-action">Ga naar GitHub ↗</span>
        </a>
      </div>
    </section>
  );
}
