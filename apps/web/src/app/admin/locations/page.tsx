import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function LocationsPage() {
  return <EntityListCreate config={entityConfigs.locations} />;
}
