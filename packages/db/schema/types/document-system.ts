/**
 * Document system: reusable templates, generated document snapshots, and flexible entity links.
 * The first intended practical use case is commercial proposal generation from quote / quote_version context.
 */

export const TABLE_DOCUMENT_TEMPLATES = "document_templates" as const;
export const TABLE_GENERATED_DOCUMENTS = "generated_documents" as const;
export const TABLE_DOCUMENT_LINKS = "document_links" as const;

export type DocumentTemplateType =
  | "quote"
  | "order"
  | "payment"
  | "installation"
  | "service"
  | "internal";

export type DocumentEntityType =
  | "quote"
  | "quote_version"
  | "order"
  | "payment"
  | "installation_job"
  | "installation_result"
  | "stock_transfer_document";

export type DocumentOutputFormat = "html" | "pdf" | "docx";

export type DocumentGenerationStatus =
  | "draft"
  | "generated"
  | "failed"
  | "archived";

export type DocumentLinkRole =
  | "primary"
  | "supporting"
  | "derived_from"
  | "related";

export interface DocumentTemplateRow {
  id: number;
  name: string;
  code: string;
  template_type: DocumentTemplateType;
  entity_type: DocumentEntityType;
  description: string | null;
  template_content: string | null;
  output_format: DocumentOutputFormat;
  is_active: number;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocumentRow {
  id: number;
  template_id: number;
  document_number: string | null;
  title: string;
  entity_type: DocumentEntityType;
  entity_id: number;
  generation_status: DocumentGenerationStatus;
  rendered_content: string | null;
  file_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  generated_by_user_id: number | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentLinkRow {
  id: number;
  generated_document_id: number;
  entity_type: DocumentEntityType;
  entity_id: number;
  link_role: DocumentLinkRole;
  created_at: string;
}
