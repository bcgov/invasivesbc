/**
 * @desc Iterate an Array of Objects searching if any key matches another. e.g.: Two entries have the same invasive plant
 * @param arr Array of entries
 * @param key Key to compare e.g. 'invasive_plant'
 * @param keyLabel Plain language representation of key to appear in error message e.g. 'Invasive Plant'
 */
const noRepeatKey = (arr: Record<PropertyKey, unknown>[], key: PropertyKey, keyLabel?: string): boolean | string => {
  const removedEmpty = arr.filter((entry) => !!entry?.[key]); // Filter out empty keys
  return (
    new Set(removedEmpty.map((o) => o?.[key])).size === removedEmpty.length ||
    `The same ${String(keyLabel ?? key)} cannot appear in multiple entries.`
  );
};

export default noRepeatKey;
