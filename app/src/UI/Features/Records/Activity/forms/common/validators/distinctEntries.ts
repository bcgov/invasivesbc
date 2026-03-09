/**
 * @desc Checks for uniqueness based on a specific set of keys.
 * @param arr The array of objects to validate.
 * @param uniqueKeys The specific keys that, when combined, must be unique.
 * @param errorMessage Human-readable name for the error message.
 */
const distinctEntries = <T extends Record<string, unknown>>(
  arr: T[],
  uniqueKeys: (keyof T)[],
  errorMessage: string
): boolean | string => {
  const seen = new Set<string>();
  for (const entry of arr) {
    // Build out unique strings based on unique keys.
    const compositeId = uniqueKeys
      .map((k) => {
        const val = entry[k];
        // Normalize values to strings, handling nulls/undefined
        return val !== null && val !== undefined ? String(val).trim() : '';
      })
      .join('-');
    // Don't validate on Empty entries.
    if (compositeId.replace(/-/g, '') === '') continue;
    if (seen.has(compositeId)) {
      return errorMessage;
    }
    seen.add(compositeId);
  }
  return true;
};

export default distinctEntries;
