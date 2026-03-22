import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function ProductAttributesPage() {
  return <EntityListCreate config={entityConfigs.product_attributes} />;
}
