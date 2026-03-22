import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function WarehousesPage() {
  return <EntityListCreate config={entityConfigs.warehouses} />;
}
