import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function QuoteLinesPage() {
  return <EntityListCreate config={entityConfigs.quote_lines} />;
}
