import { notFound } from "../lib/response";
import type { Env } from "../types/env";
import { handleBranches } from "./branches";
import { handleDebugBindings } from "./debug";
import { handleDepartments } from "./departments";
import { handleEmployees } from "./employees";
import { handleHealth } from "./health";
import { handleLocations } from "./locations";
import { handlePermissions } from "./permissions";
import { handleRolePermissions } from "./role-permissions";
import { handlePurchaseReceiptLines } from "./purchase-receipt-lines";
import { handlePurchaseReceipts } from "./purchase-receipts";
import { handleInventoryCountLines } from "./inventory-count-lines";
import { handleInventoryCounts } from "./inventory-counts";
import { handleProductAttributeValues } from "./product-attribute-values";
import { handleProductAttributes } from "./product-attributes";
import { handleProductBundleItems } from "./product-bundle-items";
import { handleProductBundles } from "./product-bundles";
import { handleProductCategories } from "./product-categories";
import { handleProductSuppliers } from "./product-suppliers";
import { handleProducts } from "./products";
import { handleRoles } from "./roles";
import { handleStockReservations } from "./stock-reservations";
import { handleSuppliers } from "./suppliers";
import { handleStockAdjustmentLines } from "./stock-adjustment-lines";
import { handleStockAdjustments } from "./stock-adjustments";
import { handleStockBalances } from "./stock-balances";
import { handleStockMovementLines } from "./stock-movement-lines";
import { handleStockMovements } from "./stock-movements";
import { handleStockTransferDocuments } from "./stock-transfer-documents";
import { handleStockTransferLines } from "./stock-transfer-lines";
import { handleStockWriteoffLines } from "./stock-writeoff-lines";
import { handleStockWriteoffs } from "./stock-writeoffs";
import { handleUnits } from "./units";
import { handleUserRoles } from "./user-roles";
import { handleUsers } from "./users";
import { handleWarehousePositions } from "./warehouse-positions";
import { handleWarehouses } from "./warehouses";

export async function routeRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  switch (path) {
    case "/":
      return new Response("One Technology ERP API is running.", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    case "/health":
      return handleHealth(request);
    case "/debug/bindings":
      return handleDebugBindings(request, env);
    case "/api/roles":
      return handleRoles(request, env);
    case "/api/permissions":
      return handlePermissions(request, env);
    case "/api/role-permissions":
      return handleRolePermissions(request, env);
    case "/api/users":
      return handleUsers(request, env);
    case "/api/user-roles":
      return handleUserRoles(request, env);
    case "/api/departments":
      return handleDepartments(request, env);
    case "/api/employees":
      return handleEmployees(request, env);
    case "/api/branches":
      return handleBranches(request, env);
    case "/api/locations":
      return handleLocations(request, env);
    case "/api/warehouses":
      return handleWarehouses(request, env);
    case "/api/warehouse-positions":
      return handleWarehousePositions(request, env);
    case "/api/purchase-receipts":
      return handlePurchaseReceipts(request, env);
    case "/api/purchase-receipt-lines":
      return handlePurchaseReceiptLines(request, env);
    case "/api/product-categories":
      return handleProductCategories(request, env);
    case "/api/units":
      return handleUnits(request, env);
    case "/api/suppliers":
      return handleSuppliers(request, env);
    case "/api/stock-adjustments":
      return handleStockAdjustments(request, env);
    case "/api/stock-adjustment-lines":
      return handleStockAdjustmentLines(request, env);
    case "/api/stock-balances":
      return handleStockBalances(request, env);
    case "/api/stock-writeoffs":
      return handleStockWriteoffs(request, env);
    case "/api/stock-writeoff-lines":
      return handleStockWriteoffLines(request, env);
    case "/api/inventory-counts":
      return handleInventoryCounts(request, env);
    case "/api/inventory-count-lines":
      return handleInventoryCountLines(request, env);
    case "/api/stock-transfer-documents":
      return handleStockTransferDocuments(request, env);
    case "/api/stock-transfer-lines":
      return handleStockTransferLines(request, env);
    case "/api/stock-movements":
      return handleStockMovements(request, env);
    case "/api/stock-movement-lines":
      return handleStockMovementLines(request, env);
    case "/api/stock-reservations":
      return handleStockReservations(request, env);
    case "/api/products":
      return handleProducts(request, env);
    case "/api/product-attributes":
      return handleProductAttributes(request, env);
    case "/api/product-attribute-values":
      return handleProductAttributeValues(request, env);
    case "/api/product-suppliers":
      return handleProductSuppliers(request, env);
    case "/api/product-bundles":
      return handleProductBundles(request, env);
    case "/api/product-bundle-items":
      return handleProductBundleItems(request, env);
    default:
      return notFound();
  }
}
