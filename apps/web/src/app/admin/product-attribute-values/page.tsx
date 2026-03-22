import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function ProductAttributeValuesPage() {
  return <EntityListCreate config={entityConfigs.product_attribute_values} />;
}
