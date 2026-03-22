import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function UnitsPage() {
  return <EntityListCreate config={entityConfigs.units} />;
}
