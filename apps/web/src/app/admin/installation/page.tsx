import { DomainLanding } from "@/components/admin/domain/DomainLanding";

export default function InstallationLandingPage() {
  return (
    <DomainLanding
      title="Installation"
      summary="Coordinate installation jobs, installer assignments, and recorded completion results."
      description="Use this area for operational follow-through after commercial confirmation. Jobs are the main entry point, while assignments and results support scheduling and completion history."
      links={[
        {
          href: "/admin/installation-jobs",
          label: "Installation Jobs",
          description: "Track planned, in-progress, completed, and failed site work.",
        },
        {
          href: "/admin/installation-results",
          label: "Installation Results",
          description: "Store completion notes, issues found, and follow-up requirements.",
        },
        {
          href: "/admin/installation-assignments",
          label: "Installation Assignments",
          description: "Attach employees to jobs with clear roles and assignment timing.",
        },
      ]}
    />
  );
}
