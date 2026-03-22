import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockTransferDocumentsPage() {
  return <EntityListCreate config={entityConfigs.stock_transfer_documents} />;
}
