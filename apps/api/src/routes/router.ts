import { notFound } from "../lib/response";
import type { Env } from "../types/env";
import { handleBomChangeLogs } from "./bom-change-logs";
import { handleBomLines } from "./bom-lines";
import { handleBranches } from "./branches";
import { handleCalculationRuns } from "./calculation-runs";
import { handleConfigurationVisuals } from "./configuration-visuals";
import { handleDebugBindings } from "./debug";
import { handleDepartments } from "./departments";
import { handleDoorConfigurations } from "./door-configurations";
import { handleDoorConfigurationInputs } from "./door-configuration-inputs";
import { handleDoorConfigurationVariants } from "./door-configuration-variants";
import { handleEmployees } from "./employees";
import { handleHealth } from "./health";
import { handleInstallationAssignments } from "./installation-assignments";
import { handleInstallationJobs } from "./installation-jobs";
import { handleInstallationResults } from "./installation-results";
import { handleInventoryCountLines } from "./inventory-count-lines";
import { handleInventoryCounts } from "./inventory-counts";
import { handleLocations } from "./locations";
import { handleOrderDiscounts } from "./order-discounts";
import { handleOrderLines } from "./order-lines";
import { handleOrders } from "./orders";
import { handlePaymentMethods } from "./payment-methods";
import { handlePayments } from "./payments";
import { handlePermissions } from "./permissions";
import { handleProductAttributeValues } from "./product-attribute-values";
import { handleProductAttributes } from "./product-attributes";
import { handleProductBundleItems } from "./product-bundle-items";
import { handleProductBundles } from "./product-bundles";
import { handleProductCategories } from "./product-categories";
import { handleProductSuppliers } from "./product-suppliers";
import { handleProducts } from "./products";
import { handlePurchaseReceiptLines } from "./purchase-receipt-lines";
import { handlePurchaseReceipts } from "./purchase-receipts";
import { handleQuoteDiscounts } from "./quote-discounts";
import { handleQuoteLines } from "./quote-lines";
import { handleQuotes } from "./quotes";
import { handleQuoteVersions } from "./quote-versions";
import { handleRolePermissions } from "./role-permissions";
import { handleRoles } from "./roles";
import { handleSpringCalculationResults } from "./spring-calculation-results";
import { handleStockAdjustmentLines } from "./stock-adjustment-lines";
import { handleStockAdjustments } from "./stock-adjustments";
import { handleStockBalances } from "./stock-balances";
import { handleStockMovementLines } from "./stock-movement-lines";
import { handleStockMovements } from "./stock-movements";
import {
  handleStockReservationAction,
  handleStockReservations,
} from "./stock-reservations";
import { handleStockTransferDocuments } from "./stock-transfer-documents";
import { handleStockTransferLines } from "./stock-transfer-lines";
import { handleStockWriteoffLines } from "./stock-writeoff-lines";
import { handleStockWriteoffs } from "./stock-writeoffs";
import { handleSuppliers } from "./suppliers";
import { handleUnits } from "./units";
import { handleUserRoles } from "./user-roles";
import { handleUsers } from "./users";
import { handleWarehouses } from "./warehouses";
import { handleWarehousePositions } from "./warehouse-positions";

export async function routeRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  const stockReservationActionMatch = path.match(
    /^\/api\/stock-reservations\/(\d+)\/(release|consume|cancel)$/
  );
  if (stockReservationActionMatch) {
    return handleStockReservationAction(
      request,
      env,
      Number(stockReservationActionMatch[1]),
      stockReservationActionMatch[2] as "release" | "consume" | "cancel"
    );
  }

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
    case "/api/door-configurations":
      return handleDoorConfigurations(request, env);
    case "/api/door-configuration-variants":
      return handleDoorConfigurationVariants(request, env);
    case "/api/door-configuration-inputs":
      return handleDoorConfigurationInputs(request, env);
    case "/api/calculation-runs":
      return handleCalculationRuns(request, env);
    case "/api/spring-calculation-results":
      return handleSpringCalculationResults(request, env);
    case "/api/bom-lines":
      return handleBomLines(request, env);
    case "/api/bom-change-logs":
      return handleBomChangeLogs(request, env);
    case "/api/configuration-visuals":
      return handleConfigurationVisuals(request, env);
    case "/api/quotes":
      return handleQuotes(request, env);
    case "/api/quote-versions":
      return handleQuoteVersions(request, env);
    case "/api/quote-lines":
      return handleQuoteLines(request, env);
    case "/api/quote-discounts":
      return handleQuoteDiscounts(request, env);
    case "/api/orders":
      return handleOrders(request, env);
    case "/api/order-lines":
      return handleOrderLines(request, env);
    case "/api/order-discounts":
      return handleOrderDiscounts(request, env);
    case "/api/payment-methods":
      return handlePaymentMethods(request, env);
    case "/api/payments":
      return handlePayments(request, env);
    case "/api/installation-jobs":
      return handleInstallationJobs(request, env);
    case "/api/installation-assignments":
      return handleInstallationAssignments(request, env);
    case "/api/installation-results":
      return handleInstallationResults(request, env);
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
