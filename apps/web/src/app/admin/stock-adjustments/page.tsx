import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockAdjustmentsPage() {
  return <EntityListCreate config={entityConfigs.stock_adjustments} />;
}
