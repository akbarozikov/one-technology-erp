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
];
