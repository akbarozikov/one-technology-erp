import type { GeneratedDocumentRow, InstallationJobRow, OrderRow, QuoteRow, StockMovementRow } from "@one-technology/db";
import { getDb } from "../lib/db";
import { asSqlFailure } from "../lib/d1-errors";
import { jsonOk, methodNotAllowed } from "../lib/response";
import type { Env } from "../types/env";

type StatusCountRow = {
  status: string;
  count: number;
};

type MovementTypeCountRow = {
  movement_type: string;
  count: number;
};

type AggregateTotalsRow = {
  total_paid_amount: number | null;
  total_remaining_amount: number | null;
  total_order_grand_total: number | null;
};

export async function handleDashboardOverview(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const db = getDb(env);

  try {
    const [
      orderStatusCounts,
      orderTotal,
      paymentStatusCounts,
      paymentTotals,
      reservationStatusCounts,
      reservationTotal,
      activeReservationTotal,
      installationStatusCounts,
      installationTotal,
      recentCompletedJobs,
      generatedDocumentTotal,
      recentGeneratedDocuments,
      stockMovementTypeCounts,
      stockMovementTotal,
      recentStockMovements,
      quoteStatusCounts,
      quoteTotal,
    ] = await Promise.all([
      selectStatusCounts(db, "orders", "order_status"),
      selectCount(db, "orders"),
      selectStatusCounts(db, "orders", "payment_status"),
      selectOrderPaymentTotals(db),
      selectStatusCounts(db, "stock_reservations", "status"),
      selectCount(db, "stock_reservations"),
      selectCount(db, "stock_reservations", "WHERE status = 'active'"),
      selectStatusCounts(db, "installation_jobs", "job_status"),
      selectCount(db, "installation_jobs"),
      selectCount(
        db,
        "installation_jobs",
        "WHERE job_status = 'completed' AND actual_completed_at >= datetime('now', '-7 days')"
      ),
      selectCount(db, "generated_documents"),
      selectRecentGeneratedDocuments(db),
      selectMovementTypeCounts(db),
      selectCount(db, "stock_movements"),
      selectRecentStockMovements(db),
      selectStatusCounts(db, "quotes", "status"),
      selectCount(db, "quotes"),
    ]);

    return jsonOk({
      data: {
        orders_summary: {
          total_orders: orderTotal,
          counts_by_status: orderStatusCounts,
        },
        payments_summary: {
          counts_by_payment_status: paymentStatusCounts,
          total_paid_amount: paymentTotals.total_paid_amount ?? 0,
          total_remaining_amount: paymentTotals.total_remaining_amount ?? 0,
          total_order_grand_total: paymentTotals.total_order_grand_total ?? 0,
        },
        reservations_summary: {
          total_reservations: reservationTotal,
          active_reservations_count: activeReservationTotal,
          counts_by_status: reservationStatusCounts,
        },
        installation_summary: {
          total_jobs: installationTotal,
          recent_completed_jobs_count: recentCompletedJobs,
          counts_by_status: installationStatusCounts,
        },
        documents_summary: {
          total_generated_documents: generatedDocumentTotal,
          recent_generated_documents: recentGeneratedDocuments,
        },
        warehouse_summary: {
          total_stock_movements: stockMovementTotal,
          counts_by_movement_type: stockMovementTypeCounts,
          recent_stock_movements: recentStockMovements,
        },
        quotes_summary: {
          total_quotes: quoteTotal,
          counts_by_status: quoteStatusCounts,
        },
      },
    });
  } catch (err) {
    return asSqlFailure(err);
  }
}

async function selectCount(
  db: D1Database,
  table: string,
  whereClause = ""
): Promise<number> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS count FROM ${table} ${whereClause}`)
    .first<{ count: number | null }>();
  return row?.count ?? 0;
}

async function selectStatusCounts(
  db: D1Database,
  table: string,
  column: string
): Promise<StatusCountRow[]> {
  const { results } = await db
    .prepare(
      `SELECT ${column} AS status, COUNT(*) AS count
       FROM ${table}
       GROUP BY ${column}
       ORDER BY count DESC, ${column} ASC`
    )
    .all<StatusCountRow>();
  return results ?? [];
}

async function selectMovementTypeCounts(
  db: D1Database
): Promise<MovementTypeCountRow[]> {
  const { results } = await db
    .prepare(
      `SELECT movement_type, COUNT(*) AS count
       FROM stock_movements
       GROUP BY movement_type
       ORDER BY count DESC, movement_type ASC`
    )
    .all<MovementTypeCountRow>();
  return results ?? [];
}

async function selectOrderPaymentTotals(
  db: D1Database
): Promise<AggregateTotalsRow> {
  const row = await db
    .prepare(
      `SELECT
         COALESCE(SUM(paid_total), 0) AS total_paid_amount,
         COALESCE(SUM(remaining_total), 0) AS total_remaining_amount,
         COALESCE(SUM(grand_total), 0) AS total_order_grand_total
       FROM orders`
    )
    .first<AggregateTotalsRow>();

  return row ?? {
    total_paid_amount: 0,
    total_remaining_amount: 0,
    total_order_grand_total: 0,
  };
}

async function selectRecentGeneratedDocuments(
  db: D1Database
): Promise<
  Pick<
    GeneratedDocumentRow,
    "id" | "title" | "document_number" | "entity_type" | "generation_status" | "generated_at"
  >[]
> {
  const { results } = await db
    .prepare(
      `SELECT id, title, document_number, entity_type, generation_status, generated_at
       FROM generated_documents
       ORDER BY generated_at DESC, id DESC
       LIMIT 5`
    )
    .all<
      Pick<
        GeneratedDocumentRow,
        "id" | "title" | "document_number" | "entity_type" | "generation_status" | "generated_at"
      >
    >();
  return results ?? [];
}

async function selectRecentStockMovements(
  db: D1Database
): Promise<
  Pick<
    StockMovementRow,
    "id" | "movement_type" | "status" | "reference_code" | "movement_date" | "related_entity_type" | "related_entity_id"
  >[]
> {
  const { results } = await db
    .prepare(
      `SELECT
         id,
         movement_type,
         status,
         reference_code,
         movement_date,
         related_entity_type,
         related_entity_id
       FROM stock_movements
       ORDER BY movement_date DESC, id DESC
       LIMIT 5`
    )
    .all<
      Pick<
        StockMovementRow,
        "id" | "movement_type" | "status" | "reference_code" | "movement_date" | "related_entity_type" | "related_entity_id"
      >
    >();
  return results ?? [];
}
