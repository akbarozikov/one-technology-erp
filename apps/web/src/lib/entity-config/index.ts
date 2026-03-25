export * from "./shared";

import { accessCompanyConfigs, accessCompanyNavGroup } from "./access-company";
import { catalogConfigs, catalogNavGroup } from "./catalog";
import { commercialConfigs, commercialNavGroup } from "./commercial";
import { constructorConfigs, constructorNavGroup } from "./constructor";
import { documentConfigs, documentNavGroup } from "./documents";
import { installationConfigs, installationNavGroup } from "./installation";
import { warehouseConfigs, warehouseNavGroup } from "./warehouse";

export const entityConfigs = {
  ...accessCompanyConfigs,
  ...catalogConfigs,
  ...warehouseConfigs,
  ...commercialConfigs,
  ...constructorConfigs,
  ...documentConfigs,
  ...installationConfigs,
};

export type EntityKey = keyof typeof entityConfigs;

export const adminNavGroups = [
  commercialNavGroup,
  warehouseNavGroup,
  installationNavGroup,
  documentNavGroup,
  catalogNavGroup,
  constructorNavGroup,
  accessCompanyNavGroup,
];

export const easySellerNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/new-sale", label: "New Sale" },
  { href: "/admin/my-sales", label: "My Sales" },
  { href: "/admin/documents-lite", label: "Documents" },
  { href: "/admin/installations-lite", label: "Installations" },
];

export const easyBossNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/approvals", label: "Awaiting Approval" },
  { href: "/admin/my-sales", label: "Sales Overview" },
  { href: "/admin/documents-lite", label: "Documents" },
  { href: "/admin/installations-lite", label: "Installations" },
];

export const easyNavItems = easySellerNavItems;
