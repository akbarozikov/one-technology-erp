/**
 * Core product rows. Primary image is determined via product_images.is_primary (no FK on products).
 */

export const TABLE_PRODUCTS = "products" as const;

export type ProductType =
  | "simple"
  | "configurable"
  | "component"
  | "assembled_system"
  | "bundle"
  | "service";

export type ProductStatus = "active" | "inactive" | "archived";

export interface ProductRow {
  id: number;
  category_id: number | null;
  default_unit_id: number;
  name: string;
  sku: string;
  barcode: string | null;
  product_type: ProductType;
  status: ProductStatus;
  description: string | null;
  short_description: string | null;
  brand: string | null;
  minimum_sale_price: number | null;
  is_stock_tracked: number;
  is_sellable: number;
  is_purchasable: number;
  is_service: number;
  has_variants: number;
  has_attributes: number;
  allow_manual_price: number;
  created_at: string;
  updated_at: string;
}
