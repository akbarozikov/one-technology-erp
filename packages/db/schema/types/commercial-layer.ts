/**
 * Commercial layer: quote, order, and payment history with snapshots and stored totals.
 */

export const TABLE_QUOTES = "quotes" as const;
export const TABLE_QUOTE_VERSIONS = "quote_versions" as const;
export const TABLE_QUOTE_LINES = "quote_lines" as const;
export const TABLE_QUOTE_DISCOUNTS = "quote_discounts" as const;
export const TABLE_ORDERS = "orders" as const;
export const TABLE_ORDER_LINES = "order_lines" as const;
export const TABLE_ORDER_DISCOUNTS = "order_discounts" as const;
export const TABLE_PAYMENT_METHODS = "payment_methods" as const;
export const TABLE_PAYMENTS = "payments" as const;

export type QuoteStatus =
  | "draft"
  | "active"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";

export type QuoteVersionStatus =
  | "draft"
  | "prepared"
  | "sent"
  | "accepted"
  | "rejected"
  | "superseded"
  | "cancelled";

export type CommercialReservationStatus =
  | "none"
  | "partially_reserved"
  | "fully_reserved"
  | "released"
  | "consumed";

export type LineType =
  | "product"
  | "bundle"
  | "configuration"
  | "service"
  | "custom";

export type DiscountType = "amount" | "percent";

export type FulfillmentType =
  | "installation"
  | "pickup"
  | "delivery_without_installation";

export type OrderStatus =
  | "draft"
  | "reserved"
  | "awaiting_payment"
  | "partially_paid"
  | "ready_for_fulfillment"
  | "scheduled_installation"
  | "fulfilled"
  | "completed"
  | "cancelled";

export type OrderPaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "refunded";

export type FulfillmentStatus =
  | "pending"
  | "reserved"
  | "issued"
  | "installed"
  | "cancelled";

export type PaymentRecordStatus = "recorded" | "confirmed" | "cancelled";

export interface QuoteRow {
  id: number;
  deal_id: number | null;
  quote_number: string;
  status: QuoteStatus;
  currency: string;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  discount_total: number | null;
  grand_total: number | null;
  valid_until: string | null;
  created_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteVersionRow {
  id: number;
  quote_id: number;
  version_number: number;
  version_status: QuoteVersionStatus;
  is_current: number;
  based_on_version_id: number | null;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  discount_total: number | null;
  grand_total: number | null;
  reservation_status: CommercialReservationStatus;
  notes: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineRow {
  id: number;
  quote_version_id: number;
  line_number: number;
  line_type: LineType;
  product_id: number | null;
  configuration_variant_id: number | null;
  quantity: number;
  unit_id: number;
  unit_price: number | null;
  minimum_unit_price: number | null;
  line_discount_type: DiscountType | null;
  line_discount_value: number | null;
  line_discount_total: number | null;
  line_total: number | null;
  snapshot_product_name: string;
  snapshot_sku: string;
  snapshot_unit_name: string;
  snapshot_description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteDiscountRow {
  id: number;
  quote_version_id: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_total: number | null;
  reason: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: number;
  quote_version_id: number | null;
  customer_id: number | null;
  deal_id: number | null;
  order_number: string;
  installation_required: number;
  fulfillment_type: FulfillmentType;
  order_status: OrderStatus;
  payment_status: OrderPaymentStatus;
  reservation_status: CommercialReservationStatus;
  currency: string;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  discount_total: number | null;
  grand_total: number | null;
  paid_total: number | null;
  remaining_total: number | null;
  order_date: string;
  planned_installation_date: string | null;
  completed_at: string | null;
  created_by_user_id: number | null;
  approved_by_user_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderLineRow {
  id: number;
  order_id: number;
  line_number: number;
  line_type: LineType;
  product_id: number | null;
  configuration_variant_id: number | null;
  quantity: number;
  unit_id: number;
  unit_price: number | null;
  minimum_unit_price: number | null;
  line_discount_type: DiscountType | null;
  line_discount_value: number | null;
  line_discount_total: number | null;
  line_total: number | null;
  fulfillment_status: FulfillmentStatus;
  snapshot_product_name: string;
  snapshot_sku: string;
  snapshot_unit_name: string;
  snapshot_description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDiscountRow {
  id: number;
  order_id: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_total: number | null;
  reason: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodRow {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: number;
  order_id: number;
  payment_method_id: number;
  payment_date: string;
  amount: number;
  currency: string;
  reference_number: string | null;
  received_by_user_id: number | null;
  notes: string | null;
  status: PaymentRecordStatus;
  created_at: string;
  updated_at: string;
}
