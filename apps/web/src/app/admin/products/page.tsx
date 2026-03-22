import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function ProductsPage() {
  return <EntityListCreate config={entityConfigs.products} />;
}
