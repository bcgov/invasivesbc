import { useMemo } from 'react';
import { useSelector } from 'utils/use_selector';

/**
 * @const
 */
const useSuggestedJurisdictionCodes = () => {
  const allJurisdictionCodes = useSelector((state) => state.ActivityPage.formCodes?.JurisdictionCode);
  const suggestedJurisdictions = useSelector((state) => state.ActivityPage.suggestedJurisdictions);

  // Flag all jurisdiction codes that are suggested and sort to the top of the list
  const jurisdictionCodes = useMemo(() => {
    if (!suggestedJurisdictions || suggestedJurisdictions.length === 0) return allJurisdictionCodes;
    const reducedSuggestions = new Set(suggestedJurisdictions.map((j) => j?.geojson?.properties?.code_name));
    const suggested = allJurisdictionCodes.map((j) =>
      reducedSuggestions.has(j.code) ? { ...j, full_name: `★ ${j.full_name} - Suggested based on location` } : j
    );
    suggested.sort((a, b) => {
      if (reducedSuggestions.has(a.code)) return -1;
      else if (reducedSuggestions.has(b.code)) return 1;
      else if ('code_sort_order' in a && 'code_sort_order' in b) {
        return a.code_sort_order! - b.code_sort_order!;
      } else return a.full_name.localeCompare(b.full_name);
    });
    return structuredClone(suggested);
  }, [allJurisdictionCodes, suggestedJurisdictions]);

  return { jurisdictionCodes };
};

export default useSuggestedJurisdictionCodes;
