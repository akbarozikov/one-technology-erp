import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockWriteoffLinesPage() {
  return <EntityListCreate config={entityConfigs.stock_writeoff_lines} />;
}
