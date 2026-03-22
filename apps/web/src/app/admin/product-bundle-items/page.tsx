import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function ProductBundleItemsPage() {
  return <EntityListCreate config={entityConfigs.product_bundle_items} />;
}
