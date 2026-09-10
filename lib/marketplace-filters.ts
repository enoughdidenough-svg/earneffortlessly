export const MARKETPLACE_FILTERS = [
  'query','category','subcategory','minPrice','maxPrice','currency','minRating','quality','seller','dateFrom','dateTo','available',
  'language','licenseType','commercialUse','sourceIncluded','instantDelivery','fileType','tag','compatibleWith','difficulty','orientation','colorFamily','version','sizeLabel','featured','minContents'
] as const;

export type MarketplaceFilter = typeof MARKETPLACE_FILTERS[number];
export const MARKETPLACE_FILTER_COUNT = MARKETPLACE_FILTERS.length;

export function parseBool(value: string | null) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}
