import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function QuotesPage() {
  return <EntityListCreate config={entityConfigs.quotes} />;
}
