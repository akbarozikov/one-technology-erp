import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockMovementsPage() {
  return <EntityListCreate config={entityConfigs.stock_movements} />;
}
