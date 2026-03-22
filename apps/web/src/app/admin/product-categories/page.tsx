import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function ProductCategoriesPage() {
  return <EntityListCreate config={entityConfigs.product_categories} />;
}
