import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function ProductBundlesPage() {
  return <EntityListCreate config={entityConfigs.product_bundles} />;
}
