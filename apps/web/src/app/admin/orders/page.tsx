import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function OrdersPage() {
  return <EntityListCreate config={entityConfigs.orders} />;
}
