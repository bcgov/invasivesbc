/**
 * @desc Iterate an Array of Objects searching if any key matches another. e.g.: Two entries have the same invasive plant
 * @param arr Array of entries
 * @param key Key to compare e.g. 'invasive_plant'
 * @param keyLabel Plain language representation of key to appear in error message e.g. 'Invasive Plant'
 */
const noRepeatKey = <T extends Record<PropertyKey, unknown>>(
  arr: T[],
  key: keyof T,
  keyLabel?: string
): boolean | string => {
  const seen = new Set();

  for (const entry of arr) {
    const value = entry?.[key];
    // Skip empty fields
    if (value === undefined || value === null || value === '') continue;
    if (seen.has(value)) {
      return `The same ${keyLabel ?? String(key)} cannot appear in multiple entries.`;
    }
    seen.add(value);
  }
  return true;
};

export default noRepeatKey;
