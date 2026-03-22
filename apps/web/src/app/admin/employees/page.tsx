import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function EmployeesPage() {
  return <EntityListCreate config={entityConfigs.employees} />;
}
