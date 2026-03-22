import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockMovementLinesPage() {
  return <EntityListCreate config={entityConfigs.stock_movement_lines} />;
}
