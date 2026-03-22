import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function BranchesPage() {
  return <EntityListCreate config={entityConfigs.branches} />;
}
