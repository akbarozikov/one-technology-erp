import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function BomChangeLogsPage() {
  return <EntityListCreate config={entityConfigs.bom_change_logs} />;
}
