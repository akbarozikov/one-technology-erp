import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function BomLinesPage() {
  return <EntityListCreate config={entityConfigs.bom_lines} />;
}
