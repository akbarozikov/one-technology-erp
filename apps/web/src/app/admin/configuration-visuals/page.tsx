import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function ConfigurationVisualsPage() {
  return <EntityListCreate config={entityConfigs.configuration_visuals} />;
}
