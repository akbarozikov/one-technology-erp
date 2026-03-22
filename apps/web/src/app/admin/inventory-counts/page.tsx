import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function InventoryCountsPage() {
  return <EntityListCreate config={entityConfigs.inventory_counts} />;
}
