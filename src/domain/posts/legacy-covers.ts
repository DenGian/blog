export const legacyCoverBySlug = {
  "eerste-week-als-software-engineer-stagiair-van-overweldiging-naar-vooruitgang":
    "/covers/week-01-progress.svg",
  "week-2-als-software-engineer-stagiair-bouwen-aan-fundamenten":
    "/covers/week-02-foundations.svg",
  "week-3-als-software-engineer-stagiair-nugets-scripts-en-debugging":
    "/covers/week-03-debugging.svg",
  "week-4-probleemoplossend-werken-en-refactoring":
    "/covers/week-04-refactoring.svg",
  "week-5-nuget-deployment-unit-testing-en-een-vleugje-timotheus":
    "/covers/week-05-testing.svg",
  "week-6-van-trailblazer-tot-beurservaring": "/covers/week-06-experience.svg",
  "week-7-docker-ci-cd-en-plugin-development-in-volle-gang":
    "/covers/week-07-pipeline.svg",
  "week-8-docker-githubs-actions-en-klantprojecten":
    "/covers/week-08-growth.svg",
  "week-9-projectrefactoring-nuget-optimalisaties-en-ghost-cms":
    "/covers/week-09-optimization.svg",
  "week-10-tussen-test-automatie-en-telefonie":
    "/covers/week-10-automation.svg",
  "week-11-bugs-refactoring-en-projecten": "/covers/week-11-bugs.svg",
  "week-12-van-nuget-mysteries-tot-docker-architectuur-een-intensive-refactoring-week":
    "/covers/week-12-architecture.svg",
  "week-13-docker-mastery-client-evolution-en-daadkracht-van-ssl-struggles-tot-porto":
    "/covers/week-13-evolution.svg",
  "week-14-deployment-pipelines-docker-integratie-en-het-afronden-van-losse-eindjes":
    "/covers/week-14-integration.svg",
  "week-15-de-laatste-loodjes-ftp-deployment-synchronisatie-en-een-afscheid":
    "/covers/week-15-finale.svg",
} as const satisfies Record<string, `/covers/${string}.svg`>;

export type LegacyCoverSlug = keyof typeof legacyCoverBySlug;

export function legacyCoverForSlug(slug: string): string | undefined {
  return legacyCoverBySlug[slug as LegacyCoverSlug];
}
