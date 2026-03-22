import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function DoorConfigurationInputsPage() {
  return <EntityListCreate config={entityConfigs.door_configuration_inputs} />;
}
