import { createFilterOptions } from '@mui/material/Autocomplete';
import StarIcon from '@mui/icons-material/Star';
import { Typography, Box, TextField, Autocomplete } from '@mui/material';
import { SelectAutoCompleteContext } from 'UI/Overlay/Records/Activity/form/SelectAutoCompleteContext';
import { useContext, useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { useSelector } from 'utils/use_selector';
import { nanoid } from '@reduxjs/toolkit';
// Custom type to support this widget
export type AutoCompleteSelectOption = { label: string; value: any; title: any; suggested?: boolean };

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

/**
 * @desc A widget that supports a single-select dropdown field with search filtering.
 * @example JSON-Schema example
 * {
 *   type: 'array',
 *   title: 'Single Select Field Title',
 *   items: {
 *     type: 'number',
 *     anyOf: [
 *       {
 *         type: 'number',
 *         title: 'Option 1',
 *         enum: [1]
 *       },
 *       {
 *         type: 'number',
 *         title: 'Option 2',
 *         enum: [2]
 *       },
 *     ]
 *   },
 *   uniqueItems: true
 * }
 * @example uiSchema (assuming you register the widget as `single-select-autocomplete`:
 * { 'ui:widget': 'single-select-autocomplete' }
 * @param {WidgetProps} props standard RJSF widget props
 */

const SingleSelectAutoComplete = (props: WidgetProps) => {
  const suggestedJurisdictionsInState = useSelector((state) => state.ActivityPage.suggestedJurisdictions);
  const selectAutoCompleteContext = useContext(SelectAutoCompleteContext);
  if (!selectAutoCompleteContext) {
    throw new Error('Context not provided to SingleSelectAutoComplete.tsx');
  }
  const { setLastFieldChanged, lastFieldChanged } = selectAutoCompleteContext;

  const optionValueLabels: Record<string, any> = {};
  const optionValueSuggested: Record<string, any> = {};

  const isEnums = props.options?.enumOptions && props.options.enumOptions.length > 0;
  const enumOptions: AutoCompleteSelectOption[] = isEnums
    ? JSON.parse(JSON.stringify(props.options.enumOptions ?? []))
    : (JSON.parse(JSON.stringify(props?.schema?.options ?? [])) ?? []);

  if (props.id.includes('jurisdiction_code')) {
    handleSuggestedJurisdictions(suggestedJurisdictionsInState, enumOptions);
  }

  const optionValues = Object.values(enumOptions).map((option) => {
    optionValueLabels[option.value] = option.label ?? option.title ?? option.value;
    optionValueSuggested[option.value] = option.suggested ?? false;
    return option.value;
  });

  const startingValue = props.value ?? null;
  const [value, setValue] = useState(startingValue);
  const [inputValue, setInputValue] = useState(startingValue ? optionValueLabels[startingValue] : '');
  const [renderKey, setRenderKey] = useState(props.id + nanoid());

  useEffect(() => {
    if (!lastFieldChanged['id']) {
      return;
    }
    if (
      lastFieldChanged['id'].includes('slope_code') &&
      lastFieldChanged['option'].includes('FL') &&
      props.id.includes('aspect_code')
    ) {
      setValue('FL');
    }
    if (
      lastFieldChanged['id'].includes('aspect_code') &&
      lastFieldChanged['option'].includes('FL') &&
      props.id.includes('slope_code')
    ) {
      setValue('FL');
    }
  }, [lastFieldChanged, props.id]);

  useEffect(() => {
    setLastFieldChanged({ id: props.id, option: value });
  }, []);

  useEffect(() => {
    if (props.id.includes('jurisdiction_code')) {
      setRenderKey(props.id + nanoid());
    }
  }, [JSON.stringify(suggestedJurisdictionsInState)]);

  return (
    <div>
      <Autocomplete
        key={renderKey}
        autoHighlight
        autoSelect={props.required}
        blurOnSelect
        openOnFocus
        renderOption={(props, option) => {
          return (
            //@ts-ignore
            <Box {...props} key={`rjsfSingleSelect${nanoid()}`} style={{ display: 'flex', flexDirection: 'row' }}>
              {optionValueSuggested[option] && <StarIcon style={{ fontSize: 15, marginRight: 7 }} color="warning" />}
              <Typography>
                {option ? optionValueLabels[option] : ''}
                {optionValueSuggested[option] && <i> - Suggested based on location</i>}
              </Typography>
            </Box>
          );
        }}
        selectOnFocus
        onFocus={(event) => props.onFocus(event.target.id, event.target.nodeValue)}
        isOptionEqualToValue={(option) => option === value || value === ''}
        clearOnEscape={!props.required}
        disableClearable={props.required}
        id={props.id}
        disabled={props.disabled}
        clearOnBlur={false}
        value={value}
        onLoad={(event) => {
          props.onChange(startingValue);
        }}
        onChange={(event: any, option: string, reason: string) => {
          if (reason === 'clear') {
            // NOTE: currently disabled.
            // Creates validaton issues where an empty value will pass even if required
            setValue('');
            props.onChange('');
          } else {
            setValue(option);

            // NOTE: passing string value to onChange, which might be expecting format
            // object: { value, label }
            // this will likely result in future compatibility errors with custom onChange functions
            // but can't change this easily without creating many validation errors
            props.onChange(option);
          }
        }}
        options={optionValues}
        filterOptions={createFilterOptions({
          // limit: 500, // NOTE: removed for now, but might want with very long lists
          stringify: (option) => option + ' ' + optionValueLabels[option]
        })}
        getOptionLabel={(option) => {
          return optionValueLabels[option] ? optionValueLabels[option] : '';
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            autoComplete="new-password"
            variant="outlined"
            required={props.required}
            label={props.label || props.schema.title}
            placeholder={'Begin typing to filter results...'}
          />
        )}
      />
    </div>
  );
};

export default SingleSelectAutoComplete;
