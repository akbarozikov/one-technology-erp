import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function DocumentTemplatesPage() {
  return <EntityListCreate config={entityConfigs.document_templates} />;
}
