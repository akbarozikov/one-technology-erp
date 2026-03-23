import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function InstallationJobsPage() {
  return <EntityListCreate config={entityConfigs.installation_jobs} />;
}
