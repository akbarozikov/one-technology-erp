"use client";

import { useCallback } from "react";
import { apiGet } from "@/lib/api";
import {
  DomainLandingLive,
  type DomainLandingInsights,
} from "@/components/admin/domain/DomainLandingLive";

type ProductRow = {
  id: number;
  name: string;
  sku: string | null;
  status: string;
};

type SupplierRow = {
  id: number;
};

type UnitRow = {
  id: number;
};

type ProductCategoryRow = {
  id: number;
};

async function loadCatalogInsights(): Promise<DomainLandingInsights> {
  const [productsRes, suppliersRes, unitsRes, categoriesRes] = await Promise.all([
    apiGet<{ data: ProductRow[] }>("/api/products"),
    apiGet<{ data: SupplierRow[] }>("/api/suppliers"),
    apiGet<{ data: UnitRow[] }>("/api/units"),
    apiGet<{ data: ProductCategoryRow[] }>("/api/product-categories"),
  ]);

  const products = productsRes.data ?? [];
  const suppliers = suppliersRes.data ?? [];
  const units = unitsRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  return {
    stats: [
      {
        label: "Products",
        value: products.length,
        hint: `${products.filter((product) => product.status === "active").length} active`,
      },
      {
        label: "Categories",
        value: categories.length,
        hint: "Product grouping structure",
      },
      {
        label: "Suppliers",
        value: suppliers.length,
        hint: "Purchasing reference records",
      },
      {
        label: "Units",
        value: units.length,
        hint: "Measurement definitions",
      },
    ],
    activityTitle: "Recent Product Records",
    activityLinkHref: "/admin/products",
    activityLinkLabel: "Open products",
    activityItems: products.slice(0, 5).map((product) => ({
      href: "/admin/products",
      title: product.name,
      meta: product.sku ? `SKU ${product.sku}` : `Product ${product.id}`,
      description: `Status: ${product.status}`,
    })),
    activityEmptyMessage: "No products yet.",
  };
}

export default function CatalogLandingPage() {
  const loadData = useCallback(() => loadCatalogInsights(), []);

  return (
    <DomainLandingLive
      title="Catalog"
      summary="Maintain the product, unit, supplier, and reference data used across the ERP."
      description="This area is mostly shared master data. Start with products, then move into categories, units, suppliers, attributes, and bundles when you need deeper catalog structure."
      links={[
        {
          href: "/admin/products",
          label: "Products",
          description: "Manage sellable, stock-tracked, configurable, and service items.",
        },
        {
          href: "/admin/product-categories",
          label: "Product Categories",
          description: "Organize products into a clearer business hierarchy.",
        },
        {
          href: "/admin/units",
          label: "Units",
          description: "Maintain measurement units used across warehouse and commercial work.",
        },
        {
          href: "/admin/suppliers",
          label: "Suppliers",
          description: "Keep supplier records and purchasing contacts up to date.",
        },
      ]}
      loadData={loadData}
    />
  );
}
