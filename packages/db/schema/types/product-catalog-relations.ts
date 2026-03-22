/**
 * Product–supplier links, bundle headers, and bundle line items.
 */

export const TABLE_PRODUCT_SUPPLIERS = "product_suppliers" as const;
export const TABLE_PRODUCT_BUNDLES = "product_bundles" as const;
export const TABLE_PRODUCT_BUNDLE_ITEMS = "product_bundle_items" as const;

export interface ProductSupplierRow {
  id: number;
  product_id: number;
  supplier_id: number;
  supplier_sku: string | null;
  purchase_price: number | null;
  currency: string;
  lead_time_days: number | null;
  is_preferred: number;
  created_at: string;
  updated_at: string;
}

export interface ProductBundleRow {
  id: number;
  /** The `products` row that represents this bundle (SKU, pricing shell, etc.). */
  bundle_product_id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ProductBundleItemRow {
  id: number;
  bundle_id: number;
  component_product_id: number;
  quantity: number;
  unit_id: number;
  sort_order: number;
  is_optional: number;
  created_at: string;
  updated_at: string;
}
