import { EntityListCreate } from "@/components/admin/EntityListCreate";
import { entityConfigs } from "@/lib/entity-config";

export default function DocumentLinksPage() {
  return <EntityListCreate config={entityConfigs.document_links} />;
}
