import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function InstallationResultsPage() {
  return <EntityListCreate config={entityConfigs.installation_results} />;
}
