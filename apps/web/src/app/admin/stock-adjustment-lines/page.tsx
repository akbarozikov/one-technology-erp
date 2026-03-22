import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockAdjustmentLinesPage() {
  return <EntityListCreate config={entityConfigs.stock_adjustment_lines} />;
}
