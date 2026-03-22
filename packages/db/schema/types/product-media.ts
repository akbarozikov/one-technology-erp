/**
 * Product images and downloadable files (manuals, datasheets, etc.).
 */

export const TABLE_PRODUCT_IMAGES = "product_images" as const;
export const TABLE_PRODUCT_FILES = "product_files" as const;

export type ProductFileType =
  | "manual"
  | "datasheet"
  | "drawing"
  | "certificate"
  | "other";

export interface ProductImageRow {
  id: number;
  product_id: number;
  file_url: string;
  file_name: string | null;
  mime_type: string | null;
  sort_order: number;
  is_primary: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFileRow {
  id: number;
  product_id: number;
  file_type: ProductFileType;
  file_url: string;
  file_name: string | null;
  mime_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
