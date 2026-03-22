import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function PaymentMethodsPage() {
  return <EntityListCreate config={entityConfigs.payment_methods} />;
}
