import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function StockReservationsPage() {
  return <EntityListCreate config={entityConfigs.stock_reservations} />;
}
