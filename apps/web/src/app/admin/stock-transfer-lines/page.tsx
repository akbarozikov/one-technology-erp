import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockTransferLinesPage() {
  return <EntityListCreate config={entityConfigs.stock_transfer_lines} />;
}
