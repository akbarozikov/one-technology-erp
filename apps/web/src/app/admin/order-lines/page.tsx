import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function OrderLinesPage() {
  return <EntityListCreate config={entityConfigs.order_lines} />;
}
