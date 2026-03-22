export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "boolean-select";

export type EntityField = {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  min?: number;
  step?: number | "any";
  /** For checkboxes: initial checked when creating a new row */
  defaultChecked?: boolean;
  options?: { value: string; label: string }[];
};

export type EntityConfig = {
  title: string;
  /** Worker path, e.g. /api/roles */
  apiPath: string;
  fields: EntityField[];
  createEnabled?: boolean;
};

const userStatuses = [
  { value: "active", label: "active" },
  { value: "inactive", label: "inactive" },
  { value: "suspended", label: "suspended" },
];

const employeeTypes = [
  { value: "office", label: "office" },
  { value: "sales", label: "sales" },
  { value: "installer", label: "installer" },
  { value: "admin", label: "admin" },
  { value: "mixed", label: "mixed" },
];

const branchTypes = [
  { value: "office", label: "office" },
  { value: "showroom", label: "showroom" },
  { value: "warehouse_branch", label: "warehouse_branch" },
  { value: "partner_point", label: "partner_point" },
  { value: "mixed", label: "mixed" },
];

const locationTypes = [
  { value: "office", label: "office" },
  { value: "warehouse", label: "warehouse" },
  { value: "showroom", label: "showroom" },
  { value: "partner_stock_point", label: "partner_stock_point" },
];

const warehouseTypes = [
  { value: "main", label: "main" },
  { value: "secondary", label: "secondary" },
  { value: "partner", label: "partner" },
  { value: "temporary", label: "temporary" },
];

const positionTypes = [
  { value: "zone", label: "zone" },
  { value: "rack", label: "rack" },
  { value: "shelf", label: "shelf" },
  { value: "floor_area", label: "floor_area" },
  { value: "virtual", label: "virtual" },
];

const productTypes = [
  { value: "simple", label: "simple" },
  { value: "configurable", label: "configurable" },
  { value: "component", label: "component" },
  { value: "assembled_system", label: "assembled_system" },
  { value: "bundle", label: "bundle" },
  { value: "service", label: "service" },
];

const productStatuses = [
  { value: "active", label: "active" },
  { value: "inactive", label: "inactive" },
  { value: "archived", label: "archived" },
];

const productAttributeDataTypes = [
  { value: "text", label: "text" },
  { value: "number", label: "number" },
  { value: "boolean", label: "boolean" },
  { value: "select", label: "select" },
  { value: "json", label: "json" },
];

const stockMovementTypes = [
  { value: "purchase_receipt", label: "purchase_receipt" },
  { value: "issue", label: "issue" },
  { value: "transfer", label: "transfer" },
  { value: "adjustment", label: "adjustment" },
  { value: "writeoff", label: "writeoff" },
  { value: "return", label: "return" },
  { value: "reservation_release", label: "reservation_release" },
  { value: "manual", label: "manual" },
];

const stockMovementStatuses = [
  { value: "draft", label: "draft" },
  { value: "confirmed", label: "confirmed" },
  { value: "cancelled", label: "cancelled" },
];

const warehouseDocumentStatuses = [
  { value: "draft", label: "draft" },
  { value: "confirmed", label: "confirmed" },
  { value: "cancelled", label: "cancelled" },
];

const inventoryCountStatuses = [
  { value: "draft", label: "draft" },
  { value: "in_progress", label: "in_progress" },
  { value: "completed", label: "completed" },
  { value: "cancelled", label: "cancelled" },
];

const writeoffReasons = [
  { value: "damage", label: "damage" },
  { value: "loss", label: "loss" },
  { value: "defect", label: "defect" },
  { value: "expired", label: "expired" },
  { value: "other", label: "other" },
];

const reservationStatuses = [
  { value: "active", label: "active" },
  { value: "released", label: "released" },
  { value: "consumed", label: "consumed" },
  { value: "cancelled", label: "cancelled" },
];

const configurationStatuses = [
  { value: "draft", label: "draft" },
  { value: "in_progress", label: "in_progress" },
  { value: "ready", label: "ready" },
  { value: "quoted", label: "quoted" },
  { value: "ordered", label: "ordered" },
  { value: "cancelled", label: "cancelled" },
  { value: "archived", label: "archived" },
];

const variantStatuses = [
  { value: "draft", label: "draft" },
  { value: "calculated", label: "calculated" },
  { value: "priced", label: "priced" },
  { value: "quoted", label: "quoted" },
  { value: "accepted", label: "accepted" },
  { value: "cancelled", label: "cancelled" },
];

const constructorInputTypes = [
  { value: "text", label: "text" },
  { value: "number", label: "number" },
  { value: "boolean", label: "boolean" },
  { value: "select", label: "select" },
  { value: "json", label: "json" },
];

const calculationRunTypes = [
  { value: "full", label: "full" },
  { value: "spring_only", label: "spring_only" },
  { value: "bom_only", label: "bom_only" },
  { value: "pricing_only", label: "pricing_only" },
  { value: "validation_only", label: "validation_only" },
];

const calculationRunStatuses = [
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "failed", label: "failed" },
];

const springSystemTypes = [
  { value: "torsion", label: "torsion" },
  { value: "extension", label: "extension" },
  { value: "other", label: "other" },
];

const springResultStatuses = [
  { value: "valid", label: "valid" },
  { value: "warning", label: "warning" },
  { value: "invalid", label: "invalid" },
];

const bomSourceTypes = [
  { value: "rule_engine", label: "rule_engine" },
  { value: "spring_calculation", label: "spring_calculation" },
  { value: "manual", label: "manual" },
  { value: "bundle_logic", label: "bundle_logic" },
  { value: "copied", label: "copied" },
];

const bomLineStatuses = [
  { value: "active", label: "active" },
  { value: "removed", label: "removed" },
  { value: "superseded", label: "superseded" },
];

const bomChangeTypes = [
  { value: "create", label: "create" },
  { value: "update", label: "update" },
  { value: "delete", label: "delete" },
  { value: "manual_override", label: "manual_override" },
  { value: "auto_regeneration", label: "auto_regeneration" },
];

const visualTypes = [
  { value: "2d_preview", label: "2d_preview" },
  { value: "schematic", label: "schematic" },
  { value: "image_render", label: "image_render" },
];

const quoteStatuses = [
  { value: "draft", label: "draft" },
  { value: "active", label: "active" },
  { value: "sent", label: "sent" },
  { value: "accepted", label: "accepted" },
  { value: "rejected", label: "rejected" },
  { value: "expired", label: "expired" },
  { value: "cancelled", label: "cancelled" },
];

const quoteVersionStatuses = [
  { value: "draft", label: "draft" },
  { value: "prepared", label: "prepared" },
  { value: "sent", label: "sent" },
  { value: "accepted", label: "accepted" },
  { value: "rejected", label: "rejected" },
  { value: "superseded", label: "superseded" },
  { value: "cancelled", label: "cancelled" },
];

const commercialReservationStatuses = [
  { value: "none", label: "none" },
  { value: "partially_reserved", label: "partially_reserved" },
  { value: "fully_reserved", label: "fully_reserved" },
  { value: "released", label: "released" },
  { value: "consumed", label: "consumed" },
];

const commercialLineTypes = [
  { value: "product", label: "product" },
  { value: "bundle", label: "bundle" },
  { value: "configuration", label: "configuration" },
  { value: "service", label: "service" },
  { value: "custom", label: "custom" },
];

const discountTypes = [
  { value: "amount", label: "amount" },
  { value: "percent", label: "percent" },
];

const fulfillmentTypes = [
  { value: "installation", label: "installation" },
  { value: "pickup", label: "pickup" },
  { value: "delivery_without_installation", label: "delivery_without_installation" },
];

const orderStatuses = [
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

const orderPaymentStatuses = [
  { value: "unpaid", label: "unpaid" },
  { value: "partially_paid", label: "partially_paid" },
  { value: "paid", label: "paid" },
  { value: "refunded", label: "refunded" },
];

const fulfillmentStatuses = [
  { value: "pending", label: "pending" },
  { value: "reserved", label: "reserved" },
  { value: "issued", label: "issued" },
  { value: "installed", label: "installed" },
  { value: "cancelled", label: "cancelled" },
];

const paymentRecordStatuses = [
  { value: "recorded", label: "recorded" },
  { value: "confirmed", label: "confirmed" },
  { value: "cancelled", label: "cancelled" },
];

export const entityConfigs = {
  roles: {
    title: "Roles",
    apiPath: "/api/roles",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
    ],
  },
  permissions: {
    title: "Permissions",
    apiPath: "/api/permissions",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "module", label: "Module", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
    ],
  },
  departments: {
    title: "Departments",
    apiPath: "/api/departments",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
    ],
  },
  users: {
    title: "Users",
    apiPath: "/api/users",
    fields: [
      { key: "email", label: "Email", kind: "text" },
      { key: "phone", label: "Phone", kind: "text" },
      {
        key: "password_hash",
        label: "Password hash (placeholder)",
        kind: "text",
        required: true,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: userStatuses,
      },
    ],
  },
  user_roles: {
    title: "User roles",
    apiPath: "/api/user-roles",
    fields: [
      {
        key: "user_id",
        label: "User ID",
        kind: "number",
        required: true,
      },
      {
        key: "role_id",
        label: "Role ID",
        kind: "number",
        required: true,
      },
    ],
  },
  role_permissions: {
    title: "Role permissions",
    apiPath: "/api/role-permissions",
    fields: [
      {
        key: "role_id",
        label: "Role ID",
        kind: "number",
        required: true,
      },
      {
        key: "permission_id",
        label: "Permission ID",
        kind: "number",
        required: true,
      },
    ],
  },
  employees: {
    title: "Employees",
    apiPath: "/api/employees",
    fields: [
      { key: "user_id", label: "User ID", kind: "number" },
      { key: "department_id", label: "Department ID", kind: "number" },
      { key: "first_name", label: "First name", kind: "text", required: true },
      { key: "last_name", label: "Last name", kind: "text", required: true },
      { key: "full_name", label: "Full name", kind: "text", required: true },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "job_title", label: "Job title", kind: "text" },
      {
        key: "employee_type",
        label: "Employee type",
        kind: "select",
        required: true,
        options: employeeTypes,
      },
      { key: "hire_date", label: "Hire date", kind: "text" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  branches: {
    title: "Branches",
    apiPath: "/api/branches",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "branch_type",
        label: "Branch type",
        kind: "select",
        required: true,
        options: branchTypes,
      },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "address_text", label: "Address", kind: "textarea" },
      { key: "city", label: "City", kind: "text" },
      { key: "country", label: "Country", kind: "text" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  locations: {
    title: "Locations",
    apiPath: "/api/locations",
    fields: [
      {
        key: "branch_id",
        label: "Branch ID",
        kind: "number",
        required: true,
      },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "location_type",
        label: "Location type",
        kind: "select",
        required: true,
        options: locationTypes,
      },
      { key: "address_text", label: "Address", kind: "textarea" },
      { key: "city", label: "City", kind: "text" },
      { key: "country", label: "Country", kind: "text" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  warehouses: {
    title: "Warehouses",
    apiPath: "/api/warehouses",
    fields: [
      {
        key: "location_id",
        label: "Location ID",
        kind: "number",
        required: true,
      },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "warehouse_type",
        label: "Warehouse type",
        kind: "select",
        required: true,
        options: warehouseTypes,
      },
      {
        key: "is_external",
        label: "External",
        kind: "checkbox",
      },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  warehouse_positions: {
    title: "Warehouse positions",
    apiPath: "/api/warehouse-positions",
    fields: [
      {
        key: "warehouse_id",
        label: "Warehouse ID",
        kind: "number",
        required: true,
      },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "position_type",
        label: "Position type",
        kind: "select",
        required: true,
        options: positionTypes,
      },
      { key: "parent_position_id", label: "Parent position ID", kind: "number" },
      { key: "sort_order", label: "Sort order", kind: "number" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  product_categories: {
    title: "Product categories",
    apiPath: "/api/product-categories",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "parent_category_id",
        label: "Parent category ID",
        kind: "number",
      },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
    ],
  },
  units: {
    title: "Units",
    apiPath: "/api/units",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "symbol", label: "Symbol", kind: "text" },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
    ],
  },
  suppliers: {
    title: "Suppliers",
    apiPath: "/api/suppliers",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "contact_person", label: "Contact person", kind: "text" },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "address_text", label: "Address", kind: "textarea" },
      { key: "city", label: "City", kind: "text" },
      { key: "country", label: "Country", kind: "text" },
      { key: "tax_id", label: "Tax ID", kind: "text" },
      { key: "notes", label: "Notes", kind: "textarea" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
    ],
  },
  products: {
    title: "Products",
    apiPath: "/api/products",
    fields: [
      { key: "category_id", label: "Category ID", kind: "number" },
      {
        key: "default_unit_id",
        label: "Default unit ID",
        kind: "number",
        required: true,
      },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "sku", label: "SKU", kind: "text", required: true },
      { key: "barcode", label: "Barcode", kind: "text" },
      {
        key: "product_type",
        label: "Product type",
        kind: "select",
        required: true,
        options: productTypes,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: productStatuses,
      },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "short_description",
        label: "Short description",
        kind: "textarea",
      },
      { key: "brand", label: "Brand", kind: "text" },
      {
        key: "minimum_sale_price",
        label: "Minimum sale price",
        kind: "number",
        step: "any",
      },
      {
        key: "is_stock_tracked",
        label: "Stock tracked",
        kind: "checkbox",
        defaultChecked: true,
      },
      {
        key: "is_sellable",
        label: "Sellable",
        kind: "checkbox",
        defaultChecked: true,
      },
      {
        key: "is_purchasable",
        label: "Purchasable",
        kind: "checkbox",
        defaultChecked: true,
      },
      { key: "is_service", label: "Service", kind: "checkbox" },
      { key: "has_variants", label: "Has variants", kind: "checkbox" },
      { key: "has_attributes", label: "Has attributes", kind: "checkbox" },
      {
        key: "allow_manual_price",
        label: "Allow manual price",
        kind: "checkbox",
      },
    ],
  },
  product_attributes: {
    title: "Product attributes",
    apiPath: "/api/product-attributes",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      {
        key: "data_type",
        label: "Data type",
        kind: "select",
        required: true,
        options: productAttributeDataTypes,
      },
      { key: "unit_hint", label: "Unit hint", kind: "text" },
      { key: "is_filterable", label: "Filterable", kind: "checkbox" },
      { key: "is_required", label: "Required", kind: "checkbox" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
    ],
  },
  product_attribute_values: {
    title: "Product attribute values",
    apiPath: "/api/product-attribute-values",
    fields: [
      {
        key: "product_id",
        label: "Product ID",
        kind: "number",
        required: true,
      },
      {
        key: "attribute_id",
        label: "Attribute ID",
        kind: "number",
        required: true,
      },
      { key: "value_text", label: "Value text", kind: "text" },
      {
        key: "value_number",
        label: "Value number",
        kind: "number",
        step: "any",
      },
      {
        key: "value_boolean",
        label: "Value boolean",
        kind: "boolean-select",
      },
      { key: "value_json", label: "Value JSON", kind: "textarea" },
    ],
  },
  product_suppliers: {
    title: "Product suppliers",
    apiPath: "/api/product-suppliers",
    fields: [
      {
        key: "product_id",
        label: "Product ID",
        kind: "number",
        required: true,
      },
      {
        key: "supplier_id",
        label: "Supplier ID",
        kind: "number",
        required: true,
      },
      { key: "supplier_sku", label: "Supplier SKU", kind: "text" },
      {
        key: "purchase_price",
        label: "Purchase price",
        kind: "number",
        step: "any",
      },
      { key: "currency", label: "Currency", kind: "text" },
      {
        key: "lead_time_days",
        label: "Lead time days",
        kind: "number",
        min: 0,
      },
      { key: "is_preferred", label: "Preferred", kind: "checkbox" },
    ],
  },
  product_bundles: {
    title: "Product bundles",
    apiPath: "/api/product-bundles",
    fields: [
      {
        key: "bundle_product_id",
        label: "Bundle product ID",
        kind: "number",
        required: true,
      },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "is_active",
        label: "Active",
        kind: "checkbox",
        defaultChecked: true,
      },
    ],
  },
  product_bundle_items: {
    title: "Product bundle items",
    apiPath: "/api/product-bundle-items",
    fields: [
      {
        key: "bundle_id",
        label: "Bundle ID",
        kind: "number",
        required: true,
      },
      {
        key: "component_product_id",
        label: "Component product ID",
        kind: "number",
        required: true,
      },
      {
        key: "quantity",
        label: "Quantity",
        kind: "number",
        required: true,
        min: 0.000001,
        step: "any",
      },
      {
        key: "unit_id",
        label: "Unit ID",
        kind: "number",
        required: true,
      },
      {
        key: "sort_order",
        label: "Sort order",
        kind: "number",
        min: 0,
      },
      { key: "is_optional", label: "Optional", kind: "checkbox" },
    ],
  },
  stock_balances: {
    title: "Stock balances",
    apiPath: "/api/stock-balances",
    createEnabled: false,
    fields: [
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      { key: "warehouse_id", label: "Warehouse ID", kind: "number", required: true },
      { key: "position_id", label: "Position ID", kind: "number", required: true },
      { key: "on_hand_qty", label: "On hand qty", kind: "number", required: true, step: "any", min: 0 },
      { key: "reserved_qty", label: "Reserved qty", kind: "number", required: true, step: "any", min: 0 },
      { key: "available_qty", label: "Available qty", kind: "number", required: true, step: "any", min: 0 },
      { key: "last_recalculated_at", label: "Last recalculated at", kind: "text" },
    ],
  },
  stock_movements: {
    title: "Stock movements",
    apiPath: "/api/stock-movements",
    fields: [
      {
        key: "movement_type",
        label: "Movement type",
        kind: "select",
        required: true,
        options: stockMovementTypes,
      },
      { key: "reference_code", label: "Reference code", kind: "text" },
      { key: "warehouse_id", label: "Warehouse ID", kind: "number" },
      { key: "source_warehouse_id", label: "Source warehouse ID", kind: "number" },
      { key: "destination_warehouse_id", label: "Destination warehouse ID", kind: "number" },
      { key: "related_entity_type", label: "Related entity type", kind: "text" },
      { key: "related_entity_id", label: "Related entity ID", kind: "text" },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: stockMovementStatuses,
      },
      { key: "movement_date", label: "Movement date", kind: "text", required: true },
      { key: "performed_by_user_id", label: "Performed by user ID", kind: "number" },
      { key: "approved_by_user_id", label: "Approved by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  stock_movement_lines: {
    title: "Stock movement lines",
    apiPath: "/api/stock-movement-lines",
    fields: [
      {
        key: "stock_movement_id",
        label: "Stock movement ID",
        kind: "number",
        required: true,
      },
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      { key: "from_position_id", label: "From position ID", kind: "number" },
      { key: "to_position_id", label: "To position ID", kind: "number" },
      {
        key: "quantity",
        label: "Quantity",
        kind: "number",
        required: true,
        step: "any",
        min: 0.000001,
      },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "unit_cost", label: "Unit cost", kind: "number", step: "any" },
      { key: "line_notes", label: "Line notes", kind: "textarea" },
    ],
  },
  purchase_receipts: {
    title: "Purchase receipts",
    apiPath: "/api/purchase-receipts",
    fields: [
      { key: "supplier_id", label: "Supplier ID", kind: "number", required: true },
      {
        key: "destination_warehouse_id",
        label: "Destination warehouse ID",
        kind: "number",
        required: true,
      },
      { key: "receipt_date", label: "Receipt date", kind: "text", required: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: warehouseDocumentStatuses,
      },
      { key: "receipt_number", label: "Receipt number", kind: "text" },
      { key: "source_document_number", label: "Source document number", kind: "text" },
      { key: "currency", label: "Currency", kind: "text" },
      { key: "total_amount", label: "Total amount", kind: "number", step: "any", min: 0 },
      { key: "received_by_user_id", label: "Received by user ID", kind: "number" },
      { key: "approved_by_user_id", label: "Approved by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  purchase_receipt_lines: {
    title: "Purchase receipt lines",
    apiPath: "/api/purchase-receipt-lines",
    fields: [
      {
        key: "purchase_receipt_id",
        label: "Purchase receipt ID",
        kind: "number",
        required: true,
      },
      { key: "line_number", label: "Line number", kind: "number", required: true },
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      {
        key: "destination_position_id",
        label: "Destination position ID",
        kind: "number",
        required: true,
      },
      {
        key: "quantity",
        label: "Quantity",
        kind: "number",
        required: true,
        step: "any",
        min: 0.000001,
      },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "unit_cost", label: "Unit cost", kind: "number", step: "any", min: 0 },
      { key: "line_total", label: "Line total", kind: "number", step: "any", min: 0 },
      {
        key: "snapshot_product_name",
        label: "Snapshot product name",
        kind: "text",
        required: true,
      },
      { key: "snapshot_sku", label: "Snapshot SKU", kind: "text", required: true },
      {
        key: "snapshot_unit_name",
        label: "Snapshot unit name",
        kind: "text",
        required: true,
      },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  stock_adjustments: {
    title: "Stock adjustments",
    apiPath: "/api/stock-adjustments",
    fields: [
      { key: "warehouse_id", label: "Warehouse ID", kind: "number", required: true },
      {
        key: "adjustment_date",
        label: "Adjustment date",
        kind: "text",
        required: true,
      },
      { key: "reason", label: "Reason", kind: "text" },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: warehouseDocumentStatuses,
      },
      { key: "reference_code", label: "Reference code", kind: "text" },
      { key: "performed_by_user_id", label: "Performed by user ID", kind: "number" },
      { key: "approved_by_user_id", label: "Approved by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  stock_adjustment_lines: {
    title: "Stock adjustment lines",
    apiPath: "/api/stock-adjustment-lines",
    fields: [
      {
        key: "stock_adjustment_id",
        label: "Stock adjustment ID",
        kind: "number",
        required: true,
      },
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      { key: "position_id", label: "Position ID", kind: "number", required: true },
      { key: "old_qty", label: "Old qty", kind: "number", required: true, step: "any", min: 0 },
      { key: "new_qty", label: "New qty", kind: "number", required: true, step: "any", min: 0 },
      { key: "difference_qty", label: "Difference qty", kind: "number", required: true, step: "any" },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "line_notes", label: "Line notes", kind: "textarea" },
    ],
  },
  stock_writeoffs: {
    title: "Stock writeoffs",
    apiPath: "/api/stock-writeoffs",
    fields: [
      { key: "warehouse_id", label: "Warehouse ID", kind: "number", required: true },
      { key: "writeoff_date", label: "Writeoff date", kind: "text", required: true },
      {
        key: "writeoff_reason",
        label: "Writeoff reason",
        kind: "select",
        required: true,
        options: writeoffReasons,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: warehouseDocumentStatuses,
      },
      { key: "reference_code", label: "Reference code", kind: "text" },
      { key: "performed_by_user_id", label: "Performed by user ID", kind: "number" },
      { key: "approved_by_user_id", label: "Approved by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  stock_writeoff_lines: {
    title: "Stock writeoff lines",
    apiPath: "/api/stock-writeoff-lines",
    fields: [
      {
        key: "stock_writeoff_id",
        label: "Stock writeoff ID",
        kind: "number",
        required: true,
      },
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      { key: "position_id", label: "Position ID", kind: "number", required: true },
      {
        key: "quantity",
        label: "Quantity",
        kind: "number",
        required: true,
        step: "any",
        min: 0.000001,
      },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "line_notes", label: "Line notes", kind: "textarea" },
    ],
  },
  inventory_counts: {
    title: "Inventory counts",
    apiPath: "/api/inventory-counts",
    fields: [
      { key: "warehouse_id", label: "Warehouse ID", kind: "number", required: true },
      { key: "count_date", label: "Count date", kind: "text", required: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: inventoryCountStatuses,
      },
      { key: "reference_code", label: "Reference code", kind: "text" },
      { key: "performed_by_user_id", label: "Performed by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  inventory_count_lines: {
    title: "Inventory count lines",
    apiPath: "/api/inventory-count-lines",
    fields: [
      {
        key: "inventory_count_id",
        label: "Inventory count ID",
        kind: "number",
        required: true,
      },
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      { key: "position_id", label: "Position ID", kind: "number", required: true },
      { key: "system_qty", label: "System qty", kind: "number", required: true, step: "any", min: 0 },
      { key: "counted_qty", label: "Counted qty", kind: "number", required: true, step: "any", min: 0 },
      { key: "difference_qty", label: "Difference qty", kind: "number", required: true, step: "any" },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "line_notes", label: "Line notes", kind: "textarea" },
    ],
  },
  stock_transfer_documents: {
    title: "Stock transfer documents",
    apiPath: "/api/stock-transfer-documents",
    fields: [
      {
        key: "source_warehouse_id",
        label: "Source warehouse ID",
        kind: "number",
        required: true,
      },
      {
        key: "destination_warehouse_id",
        label: "Destination warehouse ID",
        kind: "number",
        required: true,
      },
      { key: "transfer_date", label: "Transfer date", kind: "text", required: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: warehouseDocumentStatuses,
      },
      { key: "reference_code", label: "Reference code", kind: "text" },
      { key: "requested_by_user_id", label: "Requested by user ID", kind: "number" },
      { key: "confirmed_by_user_id", label: "Confirmed by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  stock_transfer_lines: {
    title: "Stock transfer lines",
    apiPath: "/api/stock-transfer-lines",
    fields: [
      {
        key: "stock_transfer_document_id",
        label: "Stock transfer document ID",
        kind: "number",
        required: true,
      },
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      { key: "from_position_id", label: "From position ID", kind: "number", required: true },
      { key: "to_position_id", label: "To position ID", kind: "number", required: true },
      {
        key: "quantity",
        label: "Quantity",
        kind: "number",
        required: true,
        step: "any",
        min: 0.000001,
      },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "line_notes", label: "Line notes", kind: "textarea" },
    ],
  },
  stock_reservations: {
    title: "Stock reservations",
    apiPath: "/api/stock-reservations",
    fields: [
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      { key: "warehouse_id", label: "Warehouse ID", kind: "number", required: true },
      { key: "position_id", label: "Position ID", kind: "number", required: true },
      {
        key: "reserved_qty",
        label: "Reserved qty",
        kind: "number",
        required: true,
        step: "any",
        min: 0.000001,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: reservationStatuses,
      },
      { key: "quote_line_id", label: "Quote line ID", kind: "number" },
      { key: "order_line_id", label: "Order line ID", kind: "number" },
      {
        key: "configuration_variant_id",
        label: "Configuration variant ID",
        kind: "number",
      },
      { key: "bom_line_id", label: "BOM line ID", kind: "number" },
      { key: "reserved_from", label: "Reserved from", kind: "text" },
      { key: "reserved_until", label: "Reserved until", kind: "text" },
      { key: "reservation_reason", label: "Reservation reason", kind: "textarea" },
      { key: "created_by_user_id", label: "Created by user ID", kind: "number" },
      { key: "released_by_user_id", label: "Released by user ID", kind: "number" },
      { key: "release_reason", label: "Release reason", kind: "textarea" },
    ],
  },
  door_configurations: {
    title: "Door configurations",
    apiPath: "/api/door-configurations",
    fields: [
      { key: "configuration_code", label: "Configuration code", kind: "text", required: true },
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "customer_id", label: "Customer ID", kind: "number" },
      { key: "deal_id", label: "Deal ID", kind: "number" },
      { key: "created_by_user_id", label: "Created by user ID", kind: "number" },
      { key: "status", label: "Status", kind: "select", options: configurationStatuses },
      { key: "is_attached_to_quote", label: "Attached to quote", kind: "checkbox" },
      { key: "is_attached_to_order", label: "Attached to order", kind: "checkbox" },
      { key: "selected_variant_id", label: "Selected variant ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  door_configuration_variants: {
    title: "Door configuration variants",
    apiPath: "/api/door-configuration-variants",
    fields: [
      { key: "configuration_id", label: "Configuration ID", kind: "number", required: true },
      { key: "variant_number", label: "Variant number", kind: "number", required: true },
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "is_current", label: "Current", kind: "checkbox", defaultChecked: true },
      { key: "is_selected", label: "Selected", kind: "checkbox" },
      { key: "variant_status", label: "Variant status", kind: "select", options: variantStatuses },
      { key: "quote_line_id", label: "Quote line ID", kind: "number" },
      { key: "order_line_id", label: "Order line ID", kind: "number" },
      { key: "minimum_sale_total", label: "Minimum sale total", kind: "number", step: "any", min: 0 },
      { key: "actual_sale_total", label: "Actual sale total", kind: "number", step: "any", min: 0 },
      { key: "bom_total_cost", label: "BOM total cost", kind: "number", step: "any", min: 0 },
      { key: "bom_total_items", label: "BOM total items", kind: "number", min: 0 },
      { key: "created_by_user_id", label: "Created by user ID", kind: "number" },
    ],
  },
  door_configuration_inputs: {
    title: "Door configuration inputs",
    apiPath: "/api/door-configuration-inputs",
    fields: [
      { key: "variant_id", label: "Variant ID", kind: "number", required: true },
      { key: "input_key", label: "Input key", kind: "text", required: true },
      { key: "input_label", label: "Input label", kind: "text", required: true },
      { key: "input_type", label: "Input type", kind: "select", required: true, options: constructorInputTypes },
      { key: "value_text", label: "Value text", kind: "text" },
      { key: "value_number", label: "Value number", kind: "number", step: "any" },
      { key: "value_boolean", label: "Value boolean", kind: "boolean-select" },
      { key: "value_json", label: "Value JSON", kind: "textarea" },
      { key: "unit_hint", label: "Unit hint", kind: "text" },
      { key: "sort_order", label: "Sort order", kind: "number", min: 0 },
    ],
  },
  calculation_runs: {
    title: "Calculation runs",
    apiPath: "/api/calculation-runs",
    fields: [
      { key: "variant_id", label: "Variant ID", kind: "number", required: true },
      { key: "run_type", label: "Run type", kind: "select", required: true, options: calculationRunTypes },
      { key: "run_status", label: "Run status", kind: "select", options: calculationRunStatuses },
      { key: "input_snapshot_json", label: "Input snapshot JSON", kind: "textarea" },
      { key: "output_snapshot_json", label: "Output snapshot JSON", kind: "textarea" },
      { key: "warnings_json", label: "Warnings JSON", kind: "textarea" },
      { key: "errors_json", label: "Errors JSON", kind: "textarea" },
      { key: "executed_by_user_id", label: "Executed by user ID", kind: "number" },
      { key: "executed_at", label: "Executed at", kind: "text" },
    ],
  },
  spring_calculation_results: {
    title: "Spring calculation results",
    apiPath: "/api/spring-calculation-results",
    fields: [
      { key: "calculation_run_id", label: "Calculation run ID", kind: "number", required: true },
      { key: "spring_system_type", label: "Spring system type", kind: "select", required: true, options: springSystemTypes },
      { key: "spring_count", label: "Spring count", kind: "number", min: 0 },
      { key: "wire_size", label: "Wire size", kind: "number", step: "any", min: 0 },
      { key: "inner_diameter", label: "Inner diameter", kind: "number", step: "any", min: 0 },
      { key: "spring_length", label: "Spring length", kind: "number", step: "any", min: 0 },
      { key: "torque_value", label: "Torque value", kind: "number", step: "any" },
      { key: "cycle_rating", label: "Cycle rating", kind: "number", min: 0 },
      { key: "safety_factor", label: "Safety factor", kind: "number", step: "any", min: 0 },
      { key: "result_status", label: "Result status", kind: "select", required: true, options: springResultStatuses },
      { key: "warning_text", label: "Warning text", kind: "textarea" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  bom_lines: {
    title: "BOM lines",
    apiPath: "/api/bom-lines",
    fields: [
      { key: "variant_id", label: "Variant ID", kind: "number", required: true },
      { key: "product_id", label: "Product ID", kind: "number", required: true },
      { key: "source_type", label: "Source type", kind: "select", required: true, options: bomSourceTypes },
      { key: "source_reference", label: "Source reference", kind: "text" },
      { key: "line_number", label: "Line number", kind: "number", required: true },
      { key: "quantity", label: "Quantity", kind: "number", required: true, step: "any", min: 0.000001 },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "waste_factor", label: "Waste factor", kind: "number", step: "any", min: 0 },
      { key: "unit_cost_snapshot", label: "Unit cost snapshot", kind: "number", step: "any", min: 0 },
      { key: "unit_price_snapshot", label: "Unit price snapshot", kind: "number", step: "any", min: 0 },
      { key: "line_cost_total", label: "Line cost total", kind: "number", step: "any", min: 0 },
      { key: "line_price_total", label: "Line price total", kind: "number", step: "any", min: 0 },
      { key: "snapshot_product_name", label: "Snapshot product name", kind: "text", required: true },
      { key: "snapshot_sku", label: "Snapshot SKU", kind: "text", required: true },
      { key: "snapshot_unit_name", label: "Snapshot unit name", kind: "text", required: true },
      { key: "is_auto_generated", label: "Auto generated", kind: "checkbox" },
      { key: "is_manually_edited", label: "Manually edited", kind: "checkbox" },
      { key: "is_optional", label: "Optional", kind: "checkbox" },
      { key: "line_status", label: "Line status", kind: "select", options: bomLineStatuses },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  bom_change_logs: {
    title: "BOM change logs",
    apiPath: "/api/bom-change-logs",
    fields: [
      { key: "variant_id", label: "Variant ID", kind: "number", required: true },
      { key: "bom_line_id", label: "BOM line ID", kind: "number" },
      { key: "change_type", label: "Change type", kind: "select", required: true, options: bomChangeTypes },
      { key: "old_values_json", label: "Old values JSON", kind: "textarea" },
      { key: "new_values_json", label: "New values JSON", kind: "textarea" },
      { key: "reason", label: "Reason", kind: "textarea" },
      { key: "changed_by_user_id", label: "Changed by user ID", kind: "number" },
    ],
  },
  configuration_visuals: {
    title: "Configuration visuals",
    apiPath: "/api/configuration-visuals",
    fields: [
      { key: "variant_id", label: "Variant ID", kind: "number", required: true },
      { key: "visual_type", label: "Visual type", kind: "select", required: true, options: visualTypes },
      { key: "file_url", label: "File URL", kind: "text", required: true },
      { key: "preview_url", label: "Preview URL", kind: "text" },
      { key: "render_version", label: "Render version", kind: "text" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  quotes: {
    title: "Quotes",
    apiPath: "/api/quotes",
    fields: [
      { key: "deal_id", label: "Deal ID", kind: "number" },
      { key: "quote_number", label: "Quote number", kind: "text", required: true },
      { key: "status", label: "Status", kind: "select", options: quoteStatuses },
      { key: "currency", label: "Currency", kind: "text" },
      { key: "minimum_sale_total", label: "Minimum sale total", kind: "number", step: "any", min: 0 },
      { key: "actual_sale_total", label: "Actual sale total", kind: "number", step: "any", min: 0 },
      { key: "discount_total", label: "Discount total", kind: "number", step: "any", min: 0 },
      { key: "grand_total", label: "Grand total", kind: "number", step: "any", min: 0 },
      { key: "valid_until", label: "Valid until", kind: "text" },
      { key: "created_by_user_id", label: "Created by user ID", kind: "number" },
      { key: "approved_by_user_id", label: "Approved by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  quote_versions: {
    title: "Quote versions",
    apiPath: "/api/quote-versions",
    fields: [
      { key: "quote_id", label: "Quote ID", kind: "number", required: true },
      { key: "version_number", label: "Version number", kind: "number", required: true },
      { key: "version_status", label: "Version status", kind: "select", options: quoteVersionStatuses },
      { key: "is_current", label: "Current", kind: "checkbox", defaultChecked: true },
      { key: "based_on_version_id", label: "Based on version ID", kind: "number" },
      { key: "minimum_sale_total", label: "Minimum sale total", kind: "number", step: "any", min: 0 },
      { key: "actual_sale_total", label: "Actual sale total", kind: "number", step: "any", min: 0 },
      { key: "discount_total", label: "Discount total", kind: "number", step: "any", min: 0 },
      { key: "grand_total", label: "Grand total", kind: "number", step: "any", min: 0 },
      { key: "reservation_status", label: "Reservation status", kind: "select", options: commercialReservationStatuses },
      { key: "notes", label: "Notes", kind: "textarea" },
      { key: "created_by_user_id", label: "Created by user ID", kind: "number" },
    ],
  },
  quote_lines: {
    title: "Quote lines",
    apiPath: "/api/quote-lines",
    fields: [
      { key: "quote_version_id", label: "Quote version ID", kind: "number", required: true },
      { key: "line_number", label: "Line number", kind: "number", required: true },
      { key: "line_type", label: "Line type", kind: "select", required: true, options: commercialLineTypes },
      { key: "product_id", label: "Product ID", kind: "number" },
      { key: "configuration_variant_id", label: "Configuration variant ID", kind: "number" },
      { key: "quantity", label: "Quantity", kind: "number", required: true, step: "any", min: 0.000001 },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "unit_price", label: "Unit price", kind: "number", step: "any", min: 0 },
      { key: "minimum_unit_price", label: "Minimum unit price", kind: "number", step: "any", min: 0 },
      { key: "line_discount_type", label: "Line discount type", kind: "select", options: discountTypes },
      { key: "line_discount_value", label: "Line discount value", kind: "number", step: "any", min: 0 },
      { key: "line_discount_total", label: "Line discount total", kind: "number", step: "any", min: 0 },
      { key: "line_total", label: "Line total", kind: "number", step: "any", min: 0 },
      { key: "snapshot_product_name", label: "Snapshot product name", kind: "text", required: true },
      { key: "snapshot_sku", label: "Snapshot SKU", kind: "text", required: true },
      { key: "snapshot_unit_name", label: "Snapshot unit name", kind: "text", required: true },
      { key: "snapshot_description", label: "Snapshot description", kind: "textarea" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  quote_discounts: {
    title: "Quote discounts",
    apiPath: "/api/quote-discounts",
    fields: [
      { key: "quote_version_id", label: "Quote version ID", kind: "number", required: true },
      { key: "discount_type", label: "Discount type", kind: "select", required: true, options: discountTypes },
      { key: "discount_value", label: "Discount value", kind: "number", required: true, step: "any", min: 0 },
      { key: "discount_total", label: "Discount total", kind: "number", step: "any", min: 0 },
      { key: "reason", label: "Reason", kind: "textarea" },
      { key: "created_by_user_id", label: "Created by user ID", kind: "number" },
    ],
  },
  orders: {
    title: "Orders",
    apiPath: "/api/orders",
    fields: [
      { key: "quote_version_id", label: "Quote version ID", kind: "number" },
      { key: "customer_id", label: "Customer ID", kind: "number" },
      { key: "deal_id", label: "Deal ID", kind: "number" },
      { key: "order_number", label: "Order number", kind: "text", required: true },
      { key: "installation_required", label: "Installation required", kind: "checkbox" },
      { key: "fulfillment_type", label: "Fulfillment type", kind: "select", options: fulfillmentTypes },
      { key: "order_status", label: "Order status", kind: "select", options: orderStatuses },
      { key: "payment_status", label: "Payment status", kind: "select", options: orderPaymentStatuses },
      { key: "reservation_status", label: "Reservation status", kind: "select", options: commercialReservationStatuses },
      { key: "currency", label: "Currency", kind: "text" },
      { key: "minimum_sale_total", label: "Minimum sale total", kind: "number", step: "any", min: 0 },
      { key: "actual_sale_total", label: "Actual sale total", kind: "number", step: "any", min: 0 },
      { key: "discount_total", label: "Discount total", kind: "number", step: "any", min: 0 },
      { key: "grand_total", label: "Grand total", kind: "number", step: "any", min: 0 },
      { key: "paid_total", label: "Paid total", kind: "number", step: "any", min: 0 },
      { key: "remaining_total", label: "Remaining total", kind: "number", step: "any", min: 0 },
      { key: "order_date", label: "Order date", kind: "text" },
      { key: "planned_installation_date", label: "Planned installation date", kind: "text" },
      { key: "completed_at", label: "Completed at", kind: "text" },
      { key: "created_by_user_id", label: "Created by user ID", kind: "number" },
      { key: "approved_by_user_id", label: "Approved by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  order_lines: {
    title: "Order lines",
    apiPath: "/api/order-lines",
    fields: [
      { key: "order_id", label: "Order ID", kind: "number", required: true },
      { key: "line_number", label: "Line number", kind: "number", required: true },
      { key: "line_type", label: "Line type", kind: "select", required: true, options: commercialLineTypes },
      { key: "product_id", label: "Product ID", kind: "number" },
      { key: "configuration_variant_id", label: "Configuration variant ID", kind: "number" },
      { key: "quantity", label: "Quantity", kind: "number", required: true, step: "any", min: 0.000001 },
      { key: "unit_id", label: "Unit ID", kind: "number", required: true },
      { key: "unit_price", label: "Unit price", kind: "number", step: "any", min: 0 },
      { key: "minimum_unit_price", label: "Minimum unit price", kind: "number", step: "any", min: 0 },
      { key: "line_discount_type", label: "Line discount type", kind: "select", options: discountTypes },
      { key: "line_discount_value", label: "Line discount value", kind: "number", step: "any", min: 0 },
      { key: "line_discount_total", label: "Line discount total", kind: "number", step: "any", min: 0 },
      { key: "line_total", label: "Line total", kind: "number", step: "any", min: 0 },
      { key: "fulfillment_status", label: "Fulfillment status", kind: "select", options: fulfillmentStatuses },
      { key: "snapshot_product_name", label: "Snapshot product name", kind: "text", required: true },
      { key: "snapshot_sku", label: "Snapshot SKU", kind: "text", required: true },
      { key: "snapshot_unit_name", label: "Snapshot unit name", kind: "text", required: true },
      { key: "snapshot_description", label: "Snapshot description", kind: "textarea" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  order_discounts: {
    title: "Order discounts",
    apiPath: "/api/order-discounts",
    fields: [
      { key: "order_id", label: "Order ID", kind: "number", required: true },
      { key: "discount_type", label: "Discount type", kind: "select", required: true, options: discountTypes },
      { key: "discount_value", label: "Discount value", kind: "number", required: true, step: "any", min: 0 },
      { key: "discount_total", label: "Discount total", kind: "number", step: "any", min: 0 },
      { key: "reason", label: "Reason", kind: "textarea" },
      { key: "created_by_user_id", label: "Created by user ID", kind: "number" },
    ],
  },
  payment_methods: {
    title: "Payment methods",
    apiPath: "/api/payment-methods",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "code", label: "Code", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "is_active", label: "Active", kind: "checkbox", defaultChecked: true },
    ],
  },
  payments: {
    title: "Payments",
    apiPath: "/api/payments",
    fields: [
      { key: "order_id", label: "Order ID", kind: "number", required: true },
      { key: "payment_method_id", label: "Payment method ID", kind: "number", required: true },
      { key: "payment_date", label: "Payment date", kind: "text", required: true },
      { key: "amount", label: "Amount", kind: "number", required: true, step: "any", min: 0.000001 },
      { key: "currency", label: "Currency", kind: "text" },
      { key: "reference_number", label: "Reference number", kind: "text" },
      { key: "received_by_user_id", label: "Received by user ID", kind: "number" },
      { key: "notes", label: "Notes", kind: "textarea" },
      { key: "status", label: "Status", kind: "select", options: paymentRecordStatuses },
    ],
  },
} as const satisfies Record<string, EntityConfig>;

export type EntityKey = keyof typeof entityConfigs;

export const adminNav: { href: string; label: string }[] = [
  { href: "/admin/roles", label: "Roles" },
  { href: "/admin/permissions", label: "Permissions" },
  { href: "/admin/user-roles", label: "User Roles" },
  { href: "/admin/role-permissions", label: "Role Permissions" },
  { href: "/admin/departments", label: "Departments" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/warehouses", label: "Warehouses" },
  { href: "/admin/warehouse-positions", label: "Warehouse positions" },
  { href: "/admin/product-categories", label: "Product Categories" },
  { href: "/admin/units", label: "Units" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/product-attributes", label: "Product Attributes" },
  {
    href: "/admin/product-attribute-values",
    label: "Product Attribute Values",
  },
  { href: "/admin/product-suppliers", label: "Product Suppliers" },
  { href: "/admin/product-bundles", label: "Product Bundles" },
  { href: "/admin/product-bundle-items", label: "Product Bundle Items" },
  { href: "/admin/stock-balances", label: "Stock Balances" },
  { href: "/admin/stock-movements", label: "Stock Movements" },
  { href: "/admin/stock-movement-lines", label: "Stock Movement Lines" },
  { href: "/admin/purchase-receipts", label: "Purchase Receipts" },
  { href: "/admin/purchase-receipt-lines", label: "Purchase Receipt Lines" },
  { href: "/admin/stock-adjustments", label: "Stock Adjustments" },
  { href: "/admin/stock-adjustment-lines", label: "Stock Adjustment Lines" },
  { href: "/admin/stock-writeoffs", label: "Stock Writeoffs" },
  { href: "/admin/stock-writeoff-lines", label: "Stock Writeoff Lines" },
  { href: "/admin/inventory-counts", label: "Inventory Counts" },
  { href: "/admin/inventory-count-lines", label: "Inventory Count Lines" },
  { href: "/admin/stock-transfer-documents", label: "Stock Transfer Documents" },
  { href: "/admin/stock-transfer-lines", label: "Stock Transfer Lines" },
  { href: "/admin/stock-reservations", label: "Stock Reservations" },
  { href: "/admin/door-configurations", label: "Door Configurations" },
  { href: "/admin/door-configuration-variants", label: "Door Configuration Variants" },
  { href: "/admin/door-configuration-inputs", label: "Door Configuration Inputs" },
  { href: "/admin/calculation-runs", label: "Calculation Runs" },
  { href: "/admin/spring-calculation-results", label: "Spring Calculation Results" },
  { href: "/admin/bom-lines", label: "BOM Lines" },
  { href: "/admin/bom-change-logs", label: "BOM Change Logs" },
  { href: "/admin/configuration-visuals", label: "Configuration Visuals" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/quote-versions", label: "Quote Versions" },
  { href: "/admin/quote-lines", label: "Quote Lines" },
  { href: "/admin/quote-discounts", label: "Quote Discounts" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/order-lines", label: "Order Lines" },
  { href: "/admin/order-discounts", label: "Order Discounts" },
  { href: "/admin/payment-methods", label: "Payment Methods" },
  { href: "/admin/payments", label: "Payments" },
];



