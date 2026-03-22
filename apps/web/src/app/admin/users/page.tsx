import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function UsersPage() {
  return <EntityListCreate config={entityConfigs.users} />;
}
