/**
 * Product catalog foundations: categories, units of measure, suppliers.
 */

export const TABLE_PRODUCT_CATEGORIES = "product_categories" as const;
export const TABLE_UNITS_OF_MEASURE = "units_of_measure" as const;
export const TABLE_SUPPLIERS = "suppliers" as const;

export interface ProductCategoryRow {
  id: number;
  parent_category_id: number | null;
  name: string;
  code: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface UnitOfMeasureRow {
  id: number;
  name: string;
  code: string;
  symbol: string | null;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierRow {
  id: number;
  name: string;
  code: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address_text: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}
