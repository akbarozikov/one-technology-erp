import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function InventoryCountLinesPage() {
  return <EntityListCreate config={entityConfigs.inventory_count_lines} />;
}
