import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function SuppliersPage() {
  return <EntityListCreate config={entityConfigs.suppliers} />;
}
