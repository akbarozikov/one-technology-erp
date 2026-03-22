import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function RolePermissionsPage() {
  return <EntityListCreate config={entityConfigs.role_permissions} />;
}
