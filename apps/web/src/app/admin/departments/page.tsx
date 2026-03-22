import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function DepartmentsPage() {
  return <EntityListCreate config={entityConfigs.departments} />;
}
