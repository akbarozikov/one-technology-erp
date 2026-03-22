import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function RolesPage() {
  return <EntityListCreate config={entityConfigs.roles} />;
}
