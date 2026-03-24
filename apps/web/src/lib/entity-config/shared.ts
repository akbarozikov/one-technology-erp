export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "date"
  | "datetime-local"
  | "boolean-select";

export type EntityLookup = {
  apiPath: string;
  labelKeys: string[];
  valueKey?: string;
  includeIdInLabel?: boolean;
};

export type EntityField = {
  key: string;
  label: string;
  kind: FieldKind;
  section?: string;
  required?: boolean;
  min?: number;
  step?: number | "any";
  defaultChecked?: boolean;
  options?: { value: string; label: string }[];
  lookup?: EntityLookup;
};

export type EntityFormSection = {
  key: string;
  label: string;
  description?: string;
};

export type EntityConfig = {
  title: string;
  apiPath: string;
  fields: EntityField[];
  formSections?: EntityFormSection[];
  createEnabled?: boolean;
  detailBasePath?: string;
  detailLabelKey?: string;
  searchKeys?: string[];
  filters?: Array<{
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }>;
};

export type EntityConfigMap = Record<string, EntityConfig>;

export type AdminNavItem = { href: string; label: string };
export type AdminNavGroup = {
  label: string;
  href?: string;
  items: AdminNavItem[];
};

export const userStatuses = [
  { value: "active", label: "active" },
  { value: "inactive", label: "inactive" },
  { value: "suspended", label: "suspended" },
];

export const employeeTypes = [
  { value: "office", label: "office" },
  { value: "sales", label: "sales" },
  { value: "installer", label: "installer" },
  { value: "admin", label: "admin" },
  { value: "mixed", label: "mixed" },
];

export const branchTypes = [
  { value: "office", label: "office" },
  { value: "showroom", label: "showroom" },
  { value: "warehouse_branch", label: "warehouse_branch" },
  { value: "partner_point", label: "partner_point" },
  { value: "mixed", label: "mixed" },
];

export const locationTypes = [
  { value: "office", label: "office" },
  { value: "warehouse", label: "warehouse" },
  { value: "showroom", label: "showroom" },
  { value: "partner_stock_point", label: "partner_stock_point" },
];

export const warehouseTypes = [
  { value: "main", label: "main" },
  { value: "secondary", label: "secondary" },
  { value: "partner", label: "partner" },
  { value: "temporary", label: "temporary" },
];

export const positionTypes = [
  { value: "zone", label: "zone" },
  { value: "rack", label: "rack" },
  { value: "shelf", label: "shelf" },
  { value: "floor_area", label: "floor_area" },
  { value: "virtual", label: "virtual" },
];

export const productTypes = [
  { value: "simple", label: "simple" },
  { value: "configurable", label: "configurable" },
  { value: "component", label: "component" },
  { value: "assembled_system", label: "assembled_system" },
  { value: "bundle", label: "bundle" },
  { value: "service", label: "service" },
];

export const productStatuses = [
  { value: "active", label: "active" },
  { value: "inactive", label: "inactive" },
  { value: "archived", label: "archived" },
];

export const productAttributeDataTypes = [
  { value: "text", label: "text" },
  { value: "number", label: "number" },
  { value: "boolean", label: "boolean" },
  { value: "select", label: "select" },
  { value: "json", label: "json" },
];

export const stockMovementTypes = [
  { value: "purchase_receipt", label: "purchase_receipt" },
  { value: "issue", label: "issue" },
  { value: "transfer", label: "transfer" },
  { value: "adjustment", label: "adjustment" },
  { value: "writeoff", label: "writeoff" },
  { value: "return", label: "return" },
  { value: "reservation_release", label: "reservation_release" },
  { value: "manual", label: "manual" },
];

export const stockMovementStatuses = [
  { value: "draft", label: "draft" },
  { value: "confirmed", label: "confirmed" },
  { value: "cancelled", label: "cancelled" },
];

export const warehouseDocumentStatuses = [
  { value: "draft", label: "draft" },
  { value: "confirmed", label: "confirmed" },
  { value: "cancelled", label: "cancelled" },
];

export const inventoryCountStatuses = [
  { value: "draft", label: "draft" },
  { value: "in_progress", label: "in_progress" },
  { value: "completed", label: "completed" },
  { value: "cancelled", label: "cancelled" },
];

export const writeoffReasons = [
  { value: "damage", label: "damage" },
  { value: "loss", label: "loss" },
  { value: "defect", label: "defect" },
  { value: "expired", label: "expired" },
  { value: "other", label: "other" },
];

export const reservationStatuses = [
  { value: "active", label: "active" },
  { value: "released", label: "released" },
  { value: "consumed", label: "consumed" },
  { value: "cancelled", label: "cancelled" },
];

export const configurationStatuses = [
  { value: "draft", label: "draft" },
  { value: "in_progress", label: "in_progress" },
  { value: "ready", label: "ready" },
  { value: "quoted", label: "quoted" },
  { value: "ordered", label: "ordered" },
  { value: "cancelled", label: "cancelled" },
  { value: "archived", label: "archived" },
];

export const variantStatuses = [
  { value: "draft", label: "draft" },
  { value: "calculated", label: "calculated" },
  { value: "priced", label: "priced" },
  { value: "quoted", label: "quoted" },
  { value: "accepted", label: "accepted" },
  { value: "cancelled", label: "cancelled" },
];

export const constructorInputTypes = [
  { value: "text", label: "text" },
  { value: "number", label: "number" },
  { value: "boolean", label: "boolean" },
  { value: "select", label: "select" },
  { value: "json", label: "json" },
];

export const calculationRunTypes = [
  { value: "full", label: "full" },
  { value: "spring_only", label: "spring_only" },
  { value: "bom_only", label: "bom_only" },
  { value: "pricing_only", label: "pricing_only" },
  { value: "validation_only", label: "validation_only" },
];

export const calculationRunStatuses = [
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "failed", label: "failed" },
];

export const springSystemTypes = [
  { value: "torsion", label: "torsion" },
  { value: "extension", label: "extension" },
  { value: "other", label: "other" },
];

export const springResultStatuses = [
  { value: "valid", label: "valid" },
  { value: "warning", label: "warning" },
  { value: "invalid", label: "invalid" },
];

export const bomSourceTypes = [
  { value: "rule_engine", label: "rule_engine" },
  { value: "spring_calculation", label: "spring_calculation" },
  { value: "manual", label: "manual" },
  { value: "bundle_logic", label: "bundle_logic" },
  { value: "copied", label: "copied" },
];

export const bomLineStatuses = [
  { value: "active", label: "active" },
  { value: "removed", label: "removed" },
  { value: "superseded", label: "superseded" },
];

export const bomChangeTypes = [
  { value: "create", label: "create" },
  { value: "update", label: "update" },
  { value: "delete", label: "delete" },
  { value: "manual_override", label: "manual_override" },
  { value: "auto_regeneration", label: "auto_regeneration" },
];

export const visualTypes = [
  { value: "2d_preview", label: "2d_preview" },
  { value: "schematic", label: "schematic" },
  { value: "image_render", label: "image_render" },
];

export const quoteStatuses = [
  { value: "draft", label: "draft" },
  { value: "active", label: "active" },
  { value: "sent", label: "sent" },
  { value: "accepted", label: "accepted" },
  { value: "rejected", label: "rejected" },
  { value: "expired", label: "expired" },
  { value: "cancelled", label: "cancelled" },
];

export const quoteVersionStatuses = [
  { value: "draft", label: "draft" },
  { value: "prepared", label: "prepared" },
  { value: "sent", label: "sent" },
  { value: "accepted", label: "accepted" },
  { value: "rejected", label: "rejected" },
  { value: "superseded", label: "superseded" },
  { value: "cancelled", label: "cancelled" },
];

export const commercialReservationStatuses = [
  { value: "none", label: "none" },
  { value: "partially_reserved", label: "partially_reserved" },
  { value: "fully_reserved", label: "fully_reserved" },
  { value: "released", label: "released" },
  { value: "consumed", label: "consumed" },
];

export const commercialLineTypes = [
  { value: "product", label: "product" },
  { value: "bundle", label: "bundle" },
  { value: "configuration", label: "configuration" },
  { value: "service", label: "service" },
  { value: "custom", label: "custom" },
];

export const discountTypes = [
  { value: "amount", label: "amount" },
  { value: "percent", label: "percent" },
];

export const fulfillmentTypes = [
  { value: "installation", label: "installation" },
  { value: "pickup", label: "pickup" },
  { value: "delivery_without_installation", label: "delivery_without_installation" },
];

export const orderStatuses = [
  { value: "draft", label: "draft" },
  { value: "reserved", label: "reserved" },
  { value: "awaiting_payment", label: "awaiting_payment" },
  { value: "partially_paid", label: "partially_paid" },
  { value: "ready_for_fulfillment", label: "ready_for_fulfillment" },
  { value: "scheduled_installation", label: "scheduled_installation" },
  { value: "fulfilled", label: "fulfilled" },
  { value: "completed", label: "completed" },
  { value: "cancelled", label: "cancelled" },
];

export const orderPaymentStatuses = [
  { value: "unpaid", label: "unpaid" },
  { value: "partially_paid", label: "partially_paid" },
  { value: "paid", label: "paid" },
  { value: "refunded", label: "refunded" },
];

export const fulfillmentStatuses = [
  { value: "pending", label: "pending" },
  { value: "reserved", label: "reserved" },
  { value: "issued", label: "issued" },
  { value: "installed", label: "installed" },
  { value: "cancelled", label: "cancelled" },
];

export const paymentRecordStatuses = [
  { value: "recorded", label: "recorded" },
  { value: "confirmed", label: "confirmed" },
  { value: "cancelled", label: "cancelled" },
];

export const installationJobTypes = [
  { value: "installation", label: "installation" },
  { value: "service", label: "service" },
  { value: "inspection", label: "inspection" },
  { value: "revisit", label: "revisit" },
];

export const installationJobStatuses = [
  { value: "draft", label: "draft" },
  { value: "scheduled", label: "scheduled" },
  { value: "in_progress", label: "in_progress" },
  { value: "completed", label: "completed" },
  { value: "cancelled", label: "cancelled" },
  { value: "failed", label: "failed" },
];

export const installationAssignmentRoles = [
  { value: "lead_installer", label: "lead_installer" },
  { value: "installer", label: "installer" },
  { value: "technician", label: "technician" },
  { value: "assistant", label: "assistant" },
];

export const installationResultStatuses = [
  { value: "completed", label: "completed" },
  { value: "partial", label: "partial" },
  { value: "failed", label: "failed" },
  { value: "revisit_required", label: "revisit_required" },
];

export const documentTemplateTypes = [
  { value: "quote", label: "quote" },
  { value: "order", label: "order" },
  { value: "payment", label: "payment" },
  { value: "installation", label: "installation" },
  { value: "service", label: "service" },
  { value: "internal", label: "internal" },
];

export const documentEntityTypes = [
  { value: "quote", label: "quote" },
  { value: "quote_version", label: "quote_version" },
  { value: "order", label: "order" },
  { value: "payment", label: "payment" },
  { value: "installation_job", label: "installation_job" },
  { value: "installation_result", label: "installation_result" },
  { value: "stock_transfer_document", label: "stock_transfer_document" },
];

export const documentOutputFormats = [
  { value: "html", label: "html" },
  { value: "pdf", label: "pdf" },
  { value: "docx", label: "docx" },
];

export const documentGenerationStatuses = [
  { value: "draft", label: "draft" },
  { value: "generated", label: "generated" },
  { value: "failed", label: "failed" },
  { value: "archived", label: "archived" },
];

export const documentLinkRoles = [
  { value: "primary", label: "primary" },
  { value: "supporting", label: "supporting" },
  { value: "derived_from", label: "derived_from" },
  { value: "related", label: "related" },
];

export const userLookup = {
  apiPath: "/api/users",
  labelKeys: ["email", "phone"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const unitLookup = {
  apiPath: "/api/units",
  labelKeys: ["name", "symbol", "code"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const warehouseLookup = {
  apiPath: "/api/warehouses",
  labelKeys: ["name", "code"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const warehousePositionLookup = {
  apiPath: "/api/warehouse-positions",
  labelKeys: ["name", "code"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const employeeLookup = {
  apiPath: "/api/employees",
  labelKeys: ["full_name", "job_title"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const paymentMethodLookup = {
  apiPath: "/api/payment-methods",
  labelKeys: ["name", "code"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const productLookup = {
  apiPath: "/api/products",
  labelKeys: ["name", "sku"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const supplierLookup = {
  apiPath: "/api/suppliers",
  labelKeys: ["name", "code"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const quoteLookup = {
  apiPath: "/api/quotes",
  labelKeys: ["quote_number", "status"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const quoteVersionLookup = {
  apiPath: "/api/quote-versions",
  labelKeys: ["version_number", "version_status"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const quoteLineLookup = {
  apiPath: "/api/quote-lines",
  labelKeys: ["line_number", "snapshot_product_name"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const orderLookup = {
  apiPath: "/api/orders",
  labelKeys: ["order_number", "order_status"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const orderLineLookup = {
  apiPath: "/api/order-lines",
  labelKeys: ["line_number", "snapshot_product_name"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const configurationLookup = {
  apiPath: "/api/door-configurations",
  labelKeys: ["configuration_code", "title"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const variantLookup = {
  apiPath: "/api/door-configuration-variants",
  labelKeys: ["name", "variant_number"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const installationJobLookup = {
  apiPath: "/api/installation-jobs",
  labelKeys: ["job_number", "job_status"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const stockMovementLookup = {
  apiPath: "/api/stock-movements",
  labelKeys: ["reference_code", "movement_type", "status"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const documentTemplateLookup = {
  apiPath: "/api/document-templates",
  labelKeys: ["name", "code"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;

export const generatedDocumentLookup = {
  apiPath: "/api/generated-documents",
  labelKeys: ["title", "document_number"],
  includeIdInLabel: true,
} as const satisfies EntityLookup;
