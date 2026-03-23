import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function GeneratedDocumentsPage() {
  return <EntityListCreate config={entityConfigs.generated_documents} />;
}
