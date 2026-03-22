import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function PurchaseReceiptsPage() {
  return <EntityListCreate config={entityConfigs.purchase_receipts} />;
}
