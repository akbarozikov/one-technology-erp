"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, apiPost, formatApiError, getApiBaseUrl } from "@/lib/api";

type ProductRow = {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  short_description: string | null;
  minimum_sale_price: number | null;
  default_unit_id: number;
  status: string;
  is_sellable: number;
};

type UnitRow = {
  id: number;
  name: string;
  symbol: string | null;
};

type QuoteRow = {
  id: number;
  quote_number: string;
  notes: string | null;
};

type QuoteVersionRow = {
  id: number;
  quote_id: number;
  version_number: number;
};

type QuoteLineRow = {
  id: number;
};

type SubmissionState = {
  loading: boolean;
  error: string | null;
  partialMessage: string | null;
  quote: QuoteRow | null;
  quoteVersion: QuoteVersionRow | null;
  quoteLine: QuoteLineRow | null;
};

function currency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toFixed(2);
}

function buildQuoteNumber(clientName: string): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes()
  ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const slug = clientName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 6);
  return `SALE-${stamp}${slug ? `-${slug}` : ""}`;
}

function buildNotes(clientName: string, notes: string): string | null {
  const parts = [
    clientName.trim() ? `Client: ${clientName.trim()}` : null,
    notes.trim() ? notes.trim() : null,
  ].filter((value): value is string => Boolean(value));
  return parts.length > 0 ? parts.join("\n") : null;
}

export default function NewSalePage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configHint, setConfigHint] = useState(false);

  const [clientName, setClientName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [touchedPrice, setTouchedPrice] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState>({
    loading: false,
    error: null,
    partialMessage: null,
    quote: null,
    quoteVersion: null,
    quoteLine: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setConfigHint(!getApiBaseUrl());

      try {
        const [productsRes, unitsRes] = await Promise.all([
          apiGet<{ data: ProductRow[] }>("/api/products"),
          apiGet<{ data: UnitRow[] }>("/api/units"),
        ]);

        if (cancelled) return;

        const sellableProducts = (productsRes.data ?? []).filter(
          (product) => product.status === "active" && product.is_sellable === 1
        );
        setProducts(sellableProducts);
        setUnits(unitsRes.data ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load sales starter data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(productId)) ?? null,
    [productId, products]
  );
  const selectedUnit = useMemo(
    () =>
      selectedProduct
        ? units.find((unit) => unit.id === selectedProduct.default_unit_id) ?? null
        : null,
    [selectedProduct, units]
  );
  const parsedQuantity = Number(quantity);
  const parsedUnitPrice = Number(unitPrice);
  const saleTotal =
    Number.isFinite(parsedQuantity) && parsedQuantity > 0 && Number.isFinite(parsedUnitPrice)
      ? parsedQuantity * parsedUnitPrice
      : null;

  useEffect(() => {
    if (!selectedProduct) return;
    if (touchedPrice) return;
    setUnitPrice(
      selectedProduct.minimum_sale_price !== null
        ? String(selectedProduct.minimum_sale_price)
        : ""
    );
  }, [selectedProduct, touchedPrice]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submission.loading) return;

    const trimmedClientName = clientName.trim();
    if (!trimmedClientName) {
      setSubmission((current) => ({
        ...current,
        error: "Client or customer name is required.",
        partialMessage: null,
      }));
      return;
    }

    if (!selectedProduct) {
      setSubmission((current) => ({
        ...current,
        error: "Choose a product or solution.",
        partialMessage: null,
      }));
      return;
    }

    if (!selectedUnit) {
      setSubmission((current) => ({
        ...current,
        error: "The selected product is missing a usable default unit.",
        partialMessage: null,
      }));
      return;
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setSubmission((current) => ({
        ...current,
        error: "Quantity must be a positive number.",
        partialMessage: null,
      }));
      return;
    }

    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
      setSubmission((current) => ({
        ...current,
        error: "Price or amount must be a positive number.",
        partialMessage: null,
      }));
      return;
    }

    const total = parsedQuantity * parsedUnitPrice;
    const combinedNotes = buildNotes(trimmedClientName, notes);
    const quoteNumber = buildQuoteNumber(trimmedClientName);

    let createdQuote: QuoteRow | null = null;
    let createdVersion: QuoteVersionRow | null = null;

    setSubmission({
      loading: true,
      error: null,
      partialMessage: null,
      quote: null,
      quoteVersion: null,
      quoteLine: null,
    });

    try {
      const quoteRes = await apiPost<{ data: QuoteRow }>("/api/quotes", {
        quote_number: quoteNumber,
        status: "draft",
        currency: "USD",
        minimum_sale_total: total,
        actual_sale_total: total,
        discount_total: 0,
        grand_total: total,
        notes: combinedNotes,
      });
      createdQuote = quoteRes.data;

      const versionRes = await apiPost<{ data: QuoteVersionRow }>("/api/quote-versions", {
        quote_id: createdQuote.id,
        version_number: 1,
        version_status: "prepared",
        is_current: true,
        minimum_sale_total: total,
        actual_sale_total: total,
        discount_total: 0,
        grand_total: total,
        reservation_status: "none",
        notes: combinedNotes,
      });
      createdVersion = versionRes.data;

      const lineRes = await apiPost<{ data: QuoteLineRow }>("/api/quote-lines", {
        quote_version_id: createdVersion.id,
        line_number: 1,
        line_type: "product",
        product_id: selectedProduct.id,
        quantity: parsedQuantity,
        unit_id: selectedUnit.id,
        unit_price: parsedUnitPrice,
        minimum_unit_price:
          selectedProduct.minimum_sale_price !== null
            ? selectedProduct.minimum_sale_price
            : parsedUnitPrice,
        line_total: total,
        snapshot_product_name: selectedProduct.name,
        snapshot_sku: selectedProduct.sku,
        snapshot_unit_name: selectedUnit.symbol || selectedUnit.name,
        snapshot_description:
          selectedProduct.short_description || selectedProduct.description || null,
        notes: notes.trim() || null,
      });

      setSubmission({
        loading: false,
        error: null,
        partialMessage: null,
        quote: createdQuote,
        quoteVersion: createdVersion,
        quoteLine: lineRes.data,
      });
    } catch (err) {
      const baseMessage =
        err instanceof ApiError
          ? formatApiError(err)
          : err instanceof Error
            ? err.message
            : "Failed to start the sale";

      setSubmission({
        loading: false,
        error: createdVersion
          ? `${baseMessage}\nThe quote and quote version were created, but the first line still needs attention.`
          : createdQuote
            ? `${baseMessage}\nThe quote was created, but the version or line still needs attention.`
            : baseMessage,
        partialMessage:
          createdVersion !== null
            ? "Open the created quote version and finish the sale from the advanced workflow."
            : createdQuote !== null
              ? "Open the quote list and continue from the partially created sale."
              : null,
        quote: createdQuote,
        quoteVersion: createdVersion,
        quoteLine: null,
      });
    }
  }

  const quickPickProducts = products.slice(0, 6);

  return (
    <div className="max-w-6xl space-y-6">
      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Easy Mode
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          New Sale
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Start a sale from the basic customer and product details only. The full commercial
          workflow stays available behind the scenes when you need it.
        </p>
      </section>

      {configHint && (
        <div
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> to
          load product and sales data.
        </div>
      )}

      {loading && (
        <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Loading the sales starter...</p>
        </section>
      )}

      {!loading && error && (
        <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Sale Details
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Capture the customer, product, quantity, and price. The system will start the
                  quote flow for you.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                      Client / Customer
                    </span>
                    <input
                      value={clientName}
                      onChange={(event) => setClientName(event.target.value)}
                      className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                      placeholder="Customer name or company"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                      Product / Solution
                    </span>
                    <select
                      value={productId}
                      onChange={(event) => {
                        setProductId(event.target.value);
                        setTouchedPrice(false);
                      }}
                      className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <option value="">Choose a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} · {product.sku}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                      Quantity
                    </span>
                    <input
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      type="number"
                      min="0.000001"
                      step="any"
                      className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                      Price / Amount
                    </span>
                    <input
                      value={unitPrice}
                      onChange={(event) => {
                        setUnitPrice(event.target.value);
                        setTouchedPrice(true);
                      }}
                      type="number"
                      min="0.000001"
                      step="any"
                      className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                    Notes / Comment
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder="Anything the next person should know about this sale"
                  />
                </label>

                {submission.error && (
                  <pre
                    className="whitespace-pre-wrap break-words rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
                    role="alert"
                  >
                    {submission.error}
                  </pre>
                )}

                {submission.partialMessage && (
                  <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                    {submission.partialMessage}
                    <div className="mt-2 flex flex-wrap gap-3">
                      {submission.quoteVersion && (
                        <Link
                          href={`/admin/quote-versions/${submission.quoteVersion.id}`}
                          className="text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          Open quote version
                        </Link>
                      )}
                      {submission.quote && (
                        <Link
                          href="/admin/quotes"
                          className="text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          Open quotes
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {submission.quote && submission.quoteVersion && submission.quoteLine && (
                  <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                    <p>Sale draft started successfully.</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <Link
                        href={`/admin/quote-versions/${submission.quoteVersion.id}`}
                        className="text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        Continue in quote version
                      </Link>
                      <Link
                        href="/admin/my-sales"
                        className="text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        Go to My Sales
                      </Link>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submission.loading}
                    className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    {submission.loading ? "Starting sale..." : "Start Sale"}
                  </button>
                  <Link
                    href="/admin/quote-versions"
                    className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Open advanced quotes
                  </Link>
                </div>
              </form>
            </section>

            <div className="space-y-6">
              <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Selected Item
                </h2>
                {selectedProduct ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {selectedProduct.name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        SKU: {selectedProduct.sku}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                          Default unit
                        </p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                          {selectedUnit ? selectedUnit.symbol || selectedUnit.name : "-"}
                        </p>
                      </div>
                      <div className="rounded border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                          Suggested price
                        </p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                          {currency(selectedProduct.minimum_sale_price)}
                        </p>
                      </div>
                      <div className="rounded border border-zinc-100 px-3 py-2 dark:border-zinc-800 sm:col-span-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                          Estimated total
                        </p>
                        <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {currency(saleTotal)}
                        </p>
                      </div>
                    </div>
                    {(selectedProduct.short_description || selectedProduct.description) && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {selectedProduct.short_description || selectedProduct.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    Choose a product to see its default unit, suggested price, and quick summary.
                  </p>
                )}
              </section>

              <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  What Happens Next
                </h2>
                <div className="mt-4 space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <p>1. The system starts a quote and the first quote version for this sale.</p>
                  <p>2. The selected product is added as the first sale line with your price and quantity.</p>
                  <p>3. You can continue from the quote-version workflow when you need proposal, order, or detailed follow-through actions.</p>
                </div>
              </section>
            </div>
          </div>

          <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Quick Picks
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Pick one of the most accessible active products to speed up the sale start.
                </p>
              </div>
              <Link
                href="/admin/products"
                className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
              >
                Open products
              </Link>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {quickPickProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setProductId(String(product.id));
                    setTouchedPrice(false);
                  }}
                  className={`rounded border px-4 py-3 text-left transition ${
                    selectedProduct?.id === product.id
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="font-medium">{product.name}</div>
                  <p
                    className={`mt-1 text-sm ${
                      selectedProduct?.id === product.id
                        ? "text-zinc-100 dark:text-zinc-700"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {product.sku}
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      selectedProduct?.id === product.id
                        ? "text-zinc-100 dark:text-zinc-700"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    Suggested price: {currency(product.minimum_sale_price)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
