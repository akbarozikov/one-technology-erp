import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function DoorConfigurationsPage() {
  return <EntityListCreate config={entityConfigs.door_configurations} />;
}
