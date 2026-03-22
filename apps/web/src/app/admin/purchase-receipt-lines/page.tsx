import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function PurchaseReceiptLinesPage() {
  return <EntityListCreate config={entityConfigs.purchase_receipt_lines} />;
}
