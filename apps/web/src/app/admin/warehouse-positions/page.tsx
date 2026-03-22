import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function WarehousePositionsPage() {
  return <EntityListCreate config={entityConfigs.warehouse_positions} />;
}
