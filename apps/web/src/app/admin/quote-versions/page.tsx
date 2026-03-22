import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function QuoteVersionsPage() {
  return <EntityListCreate config={entityConfigs.quote_versions} />;
}
