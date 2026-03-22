import type { ProductStatus, ProductType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalBoolAsInt,
  optionalEnum,
  optionalNullableFk,
  optionalNullableNumber,
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const PRODUCT_TYPES: readonly ProductType[] = [
  "simple",
  "configurable",
  "component",
  "assembled_system",
  "bundle",
  "service",
];

const PRODUCT_STATUSES: readonly ProductStatus[] = [
  "active",
  "inactive",
  "archived",
];

export interface ProductCreateInput {
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
  is_stock_tracked: 0 | 1;
  is_sellable: 0 | 1;
  is_purchasable: 0 | 1;
  is_service: 0 | 1;
  has_variants: 0 | 1;
  has_attributes: 0 | 1;
  allow_manual_price: 0 | 1;
}

export function parseProductCreate(
  body: JsonObject,
  errors: Failures
): ProductCreateInput | null {
  const category_id = optionalNullableFk(body, "category_id", errors);
  const default_unit_id = requirePositiveInt(body, "default_unit_id", errors);
  const name = requireNonEmptyString(body, "name", errors);
  const sku = requireNonEmptyString(body, "sku", errors);
  const barcode = optionalTrimmedString(body, "barcode", errors);
  const product_type = requireEnum(body, "product_type", PRODUCT_TYPES, errors);
  const status = optionalEnum(
    body,
    "status",
    PRODUCT_STATUSES,
    "active",
    errors
  );
  const description = optionalTrimmedString(body, "description", errors);
  const short_description = optionalTrimmedString(body, "short_description", errors);
  const brand = optionalTrimmedString(body, "brand", errors);
  const minPrice = optionalNullableNumber(body, "minimum_sale_price", errors);
  const is_stock_tracked = optionalBoolAsInt(body, "is_stock_tracked", 1, errors);
  const is_sellable = optionalBoolAsInt(body, "is_sellable", 1, errors);
  const is_purchasable = optionalBoolAsInt(body, "is_purchasable", 1, errors);
  const is_service = optionalBoolAsInt(body, "is_service", 0, errors);
  const has_variants = optionalBoolAsInt(body, "has_variants", 0, errors);
  const has_attributes = optionalBoolAsInt(body, "has_attributes", 0, errors);
  const allow_manual_price = optionalBoolAsInt(body, "allow_manual_price", 0, errors);

  if (
    default_unit_id === null ||
    name === null ||
    sku === null ||
    product_type === null ||
    status === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    category_id,
    default_unit_id,
    name,
    sku,
    barcode: barcode === undefined ? null : barcode,
    product_type,
    status,
    description: description === undefined ? null : description,
    short_description:
      short_description === undefined ? null : short_description,
    brand: brand === undefined ? null : brand,
    minimum_sale_price:
      minPrice === undefined ? null : minPrice === null ? null : minPrice,
    is_stock_tracked,
    is_sellable,
    is_purchasable,
    is_service,
    has_variants,
    has_attributes,
    allow_manual_price,
  };
}
