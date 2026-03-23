import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function InstallationAssignmentsPage() {
  return <EntityListCreate config={entityConfigs.installation_assignments} />;
}
