import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function CalculationRunsPage() {
  return <EntityListCreate config={entityConfigs.calculation_runs} />;
}
