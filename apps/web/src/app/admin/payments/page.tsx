import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function PaymentsPage() {
  return <EntityListCreate config={entityConfigs.payments} />;
}
