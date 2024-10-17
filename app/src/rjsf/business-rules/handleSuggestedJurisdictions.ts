import { AutoCompleteSelectOption } from 'rjsf/widgets/SingleSelectAutoComplete';

/**
 * @desc Helper used on jurisdictions keys. Iterates the SuggestedJurisdictions state and flags matching keys as suggested, sorting them to the top.
 * @param suggestedJurisdictionsInState Jurisdictions suggested given a particular area.
 * @param enumOptions Select Options list.
 */
const handleSuggestedJurisdictions = (
  suggestedJurisdictionsInState: Record<string, any>[],
  enumOptions: AutoCompleteSelectOption[]
) => {
  const suggestedJurisdictions = suggestedJurisdictionsInState ? [...suggestedJurisdictionsInState] : [];
  const additionalEnumOptions: AutoCompleteSelectOption[] = [];
  suggestedJurisdictions.forEach((jurisdiction) => {
    if (jurisdiction.geojson) {
      additionalEnumOptions.push({
        label: jurisdiction.geojson.properties.type ?? null,
        value: jurisdiction.geojson.properties.code_name ?? null,
        title: jurisdiction.geojson.properties.name ?? null,
        suggested: true
      } as AutoCompleteSelectOption);
    } else if (jurisdiction.properties) {
      additionalEnumOptions.push({
        label: jurisdiction.properties.type ?? null,
        value: jurisdiction.properties.code_name ?? null,
        title: jurisdiction.properties.name ?? null,
        suggested: true
      } as AutoCompleteSelectOption);
    }
  });
  enumOptions.forEach((option, index) => {
    additionalEnumOptions.forEach((additionalOption) => {
      if (option.value === additionalOption.value) {
        enumOptions[index].suggested = true;
      }
    });
  });
  enumOptions.sort((left, right) => {
    if (left.hasOwnProperty('suggested')) {
      return -1;
    } else if (right.hasOwnProperty('suggested')) {
      return 1;
    }
    return 0;
  });
};

export default handleSuggestedJurisdictions;
