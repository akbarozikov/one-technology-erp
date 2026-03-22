/**
 * Constructor core: configurable door records, historical calculation output, editable BOM data, and optional visuals.
 */

export const TABLE_DOOR_CONFIGURATIONS = "door_configurations" as const;
export const TABLE_DOOR_CONFIGURATION_VARIANTS = "door_configuration_variants" as const;
export const TABLE_DOOR_CONFIGURATION_INPUTS = "door_configuration_inputs" as const;
export const TABLE_CALCULATION_RUNS = "calculation_runs" as const;
export const TABLE_SPRING_CALCULATION_RESULTS = "spring_calculation_results" as const;
export const TABLE_BOM_LINES = "bom_lines" as const;
export const TABLE_BOM_CHANGE_LOGS = "bom_change_logs" as const;
export const TABLE_CONFIGURATION_VISUALS = "configuration_visuals" as const;

export type ConfigurationStatus =
  | "draft"
  | "in_progress"
  | "ready"
  | "quoted"
  | "ordered"
  | "cancelled"
  | "archived";

export type VariantStatus =
  | "draft"
  | "calculated"
  | "priced"
  | "quoted"
  | "accepted"
  | "cancelled";

export type InputType = "text" | "number" | "boolean" | "select" | "json";

export type CalculationRunType =
  | "full"
  | "spring_only"
  | "bom_only"
  | "pricing_only"
  | "validation_only";

export type CalculationRunStatus = "success" | "warning" | "failed";

export type SpringSystemType = "torsion" | "extension" | "other";

export type SpringResultStatus = "valid" | "warning" | "invalid";

export type BomSourceType =
  | "rule_engine"
  | "spring_calculation"
  | "manual"
  | "bundle_logic"
  | "copied";

export type BomLineStatus = "active" | "removed" | "superseded";

export type BomChangeType =
  | "create"
  | "update"
  | "delete"
  | "manual_override"
  | "auto_regeneration";

export type VisualType = "2d_preview" | "schematic" | "image_render";

export interface DoorConfigurationRow {
  id: number;
  configuration_code: string;
  title: string;
  customer_id: number | null;
  deal_id: number | null;
  created_by_user_id: number | null;
  status: ConfigurationStatus;
  is_attached_to_quote: number;
  is_attached_to_order: number;
  selected_variant_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoorConfigurationVariantRow {
  id: number;
  configuration_id: number;
  variant_number: number;
  name: string;
  description: string | null;
  is_current: number;
  is_selected: number;
  variant_status: VariantStatus;
  quote_line_id: number | null;
  order_line_id: number | null;
  minimum_sale_total: number | null;
  actual_sale_total: number | null;
  bom_total_cost: number | null;
  bom_total_items: number | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface DoorConfigurationInputRow {
  id: number;
  variant_id: number;
  input_key: string;
  input_label: string;
  input_type: InputType;
  value_text: string | null;
  value_number: number | null;
  value_boolean: number | null;
  value_json: string | null;
  unit_hint: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CalculationRunRow {
  id: number;
  variant_id: number;
  run_type: CalculationRunType;
  run_status: CalculationRunStatus;
  input_snapshot_json: string | null;
  output_snapshot_json: string | null;
  warnings_json: string | null;
  errors_json: string | null;
  executed_by_user_id: number | null;
  executed_at: string;
  created_at: string;
  updated_at: string;
}

export interface SpringCalculationResultRow {
  id: number;
  calculation_run_id: number;
  spring_system_type: SpringSystemType;
  spring_count: number | null;
  wire_size: number | null;
  inner_diameter: number | null;
  spring_length: number | null;
  torque_value: number | null;
  cycle_rating: number | null;
  safety_factor: number | null;
  result_status: SpringResultStatus;
  warning_text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BomLineRow {
  id: number;
  variant_id: number;
  product_id: number;
  source_type: BomSourceType;
  source_reference: string | null;
  line_number: number;
  quantity: number;
  unit_id: number;
  waste_factor: number | null;
  unit_cost_snapshot: number | null;
  unit_price_snapshot: number | null;
  line_cost_total: number | null;
  line_price_total: number | null;
  snapshot_product_name: string;
  snapshot_sku: string;
  snapshot_unit_name: string;
  is_auto_generated: number;
  is_manually_edited: number;
  is_optional: number;
  line_status: BomLineStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BomChangeLogRow {
  id: number;
  variant_id: number;
  bom_line_id: number | null;
  change_type: BomChangeType;
  old_values_json: string | null;
  new_values_json: string | null;
  reason: string | null;
  changed_by_user_id: number | null;
  created_at: string;
}

export interface ConfigurationVisualRow {
  id: number;
  variant_id: number;
  visual_type: VisualType;
  file_url: string;
  preview_url: string | null;
  render_version: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
