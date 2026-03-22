import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function SpringCalculationResultsPage() {
  return <EntityListCreate config={entityConfigs.spring_calculation_results} />;
}
