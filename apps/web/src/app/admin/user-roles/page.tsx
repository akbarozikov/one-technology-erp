import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function UserRolesPage() {
  return <EntityListCreate config={entityConfigs.user_roles} />;
}
