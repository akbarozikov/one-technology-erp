import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockWriteoffsPage() {
  return <EntityListCreate config={entityConfigs.stock_writeoffs} />;
}
