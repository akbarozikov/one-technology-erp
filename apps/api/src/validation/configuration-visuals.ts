import type { VisualType } from "@one-technology/db";
import type { JsonObject } from "../lib/json";
import type { Failures } from "./helpers";
import {
  optionalTrimmedString,
  requireEnum,
  requireNonEmptyString,
  requirePositiveInt,
} from "./helpers";

const VISUAL_TYPES: readonly VisualType[] = [
  "2d_preview",
  "schematic",
  "image_render",
];

export interface ConfigurationVisualCreateInput {
  variant_id: number;
  visual_type: VisualType;
  file_url: string;
  preview_url: string | null;
  render_version: string | null;
  notes: string | null;
}

export function parseConfigurationVisualCreate(
  body: JsonObject,
  errors: Failures
): ConfigurationVisualCreateInput | null {
  const variant_id = requirePositiveInt(body, "variant_id", errors);
  const visual_type = requireEnum(body, "visual_type", VISUAL_TYPES, errors);
  const file_url = requireNonEmptyString(body, "file_url", errors);
  const preview_url = optionalTrimmedString(body, "preview_url", errors);
  const render_version = optionalTrimmedString(body, "render_version", errors);
  const notes = optionalTrimmedString(body, "notes", errors);

  if (
    variant_id === null ||
    visual_type === null ||
    file_url === null ||
    errors.length > 0
  ) {
    return null;
  }

  return {
    variant_id,
    visual_type,
    file_url,
    preview_url: preview_url === undefined ? null : preview_url,
    render_version: render_version === undefined ? null : render_version,
    notes: notes === undefined ? null : notes,
  };
}
