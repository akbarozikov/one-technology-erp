import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function PermissionsPage() {
  return <EntityListCreate config={entityConfigs.permissions} />;
}
