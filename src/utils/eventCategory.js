// Resolves an Event Category (eventCategoryLookupId) to its live display
// label - falls back to the stored short code (eventCategoryLookupCode) only
// if the live Lookup options haven't loaded yet or no longer contain a match.
// Works on an Event, a grid row, or a Registration - anything carrying these
// two fields.
export function resolveEventCategoryLabel(entity, eventCategoryOptions) {
  if (!entity) return "-";
  const match = (eventCategoryOptions || []).find(
    (opt) => String(opt.value) === String(entity.eventCategoryLookupId),
  );
  return match?.label || entity.eventCategoryLookupCode || "-";
}
