export type JsonObject = Record<string, unknown>;

export async function readJsonObject(request: Request): Promise<JsonObject> {
  const text = await request.text();
  if (!text.trim()) {
    throw new SyntaxError("Empty body");
  }
  const parsed: unknown = JSON.parse(text);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new SyntaxError("JSON body must be an object");
  }
  return parsed as JsonObject;
}
