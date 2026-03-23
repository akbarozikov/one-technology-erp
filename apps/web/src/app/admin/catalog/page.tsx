import { DomainLanding } from "@/components/admin/domain/DomainLanding";

export default function CatalogLandingPage() {
  return (
    <DomainLanding
      title="Catalog"
      summary="Maintain the reusable product, unit, supplier, and product-structure reference data used across the ERP."
      description="This area is mostly master data. Start with products, then move into categories, units, supplier relationships, attributes, and bundles when you need deeper catalog structure."
      links={[
        {
          href: "/admin/products",
          label: "Products",
          description: "Manage sellable, stock-tracked, configurable, and service items.",
        },
        {
          href: "/admin/product-categories",
          label: "Product Categories",
          description: "Organize the catalog into a clearer business hierarchy.",
        },
        {
          href: "/admin/units",
          label: "Units",
          description: "Maintain measurement units used in warehouse and commercial flows.",
        },
        {
          href: "/admin/suppliers",
          label: "Suppliers",
          description: "Keep supplier reference records and purchasing contacts current.",
        },
      ]}
    />
  );
}
