export * from "./shared";

import { accessCompanyConfigs, accessCompanyNavGroup } from "./access-company";
import { catalogConfigs, catalogNavGroup } from "./catalog";
import { commercialConfigs, commercialNavGroup } from "./commercial";
import { constructorConfigs, constructorNavGroup } from "./constructor";
import { installationConfigs, installationNavGroup } from "./installation";
import { warehouseConfigs, warehouseNavGroup } from "./warehouse";

export const entityConfigs = {
  ...accessCompanyConfigs,
  ...catalogConfigs,
  ...warehouseConfigs,
  ...commercialConfigs,
  ...constructorConfigs,
  ...installationConfigs,
};

export type EntityKey = keyof typeof entityConfigs;

export const adminNavGroups = [
  accessCompanyNavGroup,
  catalogNavGroup,
  warehouseNavGroup,
  commercialNavGroup,
  constructorNavGroup,
  installationNavGroup,
];
