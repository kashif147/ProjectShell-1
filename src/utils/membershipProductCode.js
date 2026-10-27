/**
 * Phase A / A12: membership-category behaviour keys off the product's stable code
 * (4080 Retired Associate, 4090 Undergraduate Student) within the session tenant's MEM options
 * ([{ value, key, label, code }] from features/CategoryLookupSlice.js) - never a product id or label.
 * No options (e.g. a tenant without MEM) -> false: there is no fallback to another tenant's ids.
 */
export function optionHasProductCode(productId, productCode, categoryOptions) {
  if (!productId || !productCode || !Array.isArray(categoryOptions)) return false;
  const option = categoryOptions.find(
    (o) => String(o.value) === String(productId) || String(o.key) === String(productId),
  );
  return !!option && String(option.code) === String(productCode);
}
