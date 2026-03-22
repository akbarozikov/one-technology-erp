import { type StockBalanceRow } from "@one-technology/db";
import { getDb } from "../lib/db";
import { jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";

export async function handleStockBalances(
  request: Request,
  env: Env
): Promise<Response> {
  const db = getDb(env);

  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const { results } = await db
    .prepare(
      "SELECT * FROM stock_balances ORDER BY warehouse_id ASC, position_id ASC, product_id ASC, id ASC"
    )
    .all<StockBalanceRow>();
  return jsonOk({ data: results ?? [] });
}
