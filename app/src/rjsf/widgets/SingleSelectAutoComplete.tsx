import { createFilterOptions } from '@mui/material/Autocomplete';
import StarIcon from '@mui/icons-material/Star';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { SelectAutoCompleteContext } from 'UI/Overlay/Records/Activity/form/SelectAutoCompleteContext';
import React, { useContext, useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { useSelector } from 'react-redux';
// Custom type to support this widget
export type AutoCompleteSelectOption = { label: string; value: any; title: any };

/**
 * A widget that supports a single-select dropdown field with search filtering.
 *
 * Example schemas:
 *
 * JSON-Schema:
 *
 * ```JSON
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
 *       {
 *         type: 'number',
 *         title: 'Option 3',
 *         enum: [3]
 *       }
 *     ]
 *   },
 *   uniqueItems: true
 * }
 * ```
 *
 * uiSchema (assuming you register the widget as `single-select-autocomplete`:
 *
 * ```JSON
 * {
 *   'ui:widget': 'single-select-autocomplete'
 * }
 * ```
 *
 * @param {WidgetProps} props standard RJSF widget props
 * @return {*}
 */

type OptionType = {
  value: string;
  label: string;
  title: string;
  suggested?: any;
};

const SingleSelectAutoComplete = (props: WidgetProps) => {
  // console.dir(props)
  const suggestedJurisdictionsInState = useSelector((state: any) => state.ActivityPage.suggestedJurisdictions);
  const isenums = props.options.enumOptions?.length > 0 ? true : false;
  let enumOptions;
  if (isenums) {
    enumOptions = JSON.parse(JSON.stringify(props.options.enumOptions || []));
  } else {
    enumOptions = JSON.parse(JSON.stringify(props?.schema?.options || []));
  }

  if (!enumOptions) enumOptions = [];
  if (props.id.toString().includes('jurisdiction_code')) {
    const suggestedJurisdictions = suggestedJurisdictionsInState
      ? JSON.parse(JSON.stringify(suggestedJurisdictionsInState))
      : [];
    const additionalEnumOptions: OptionType[] = [];
    suggestedJurisdictions.forEach((jurisdiction) => {
      if (jurisdiction.geojson) {
        additionalEnumOptions.push({
          label: jurisdiction?.geojson?.properties?.type?.toString() || null,
          value: jurisdiction?.geojson?.properties?.code_name?.toString() || null,
          title: jurisdiction?.geojson?.properties?.name?.toString() || null,
          suggested: true
        } as AutoCompleteSelectOption);
      } else if (jurisdiction.properties) {
        additionalEnumOptions.push({
          label: jurisdiction?.properties?.type?.toString() || null,
          value: jurisdiction?.properties?.code_name?.toString() || null,
          title: jurisdiction?.properties?.name?.toString() || null,
          suggested: true
        } as AutoCompleteSelectOption);
      }
    });
    let enumOptionsIndex = 0;
    enumOptions.forEach((option) => {
      additionalEnumOptions.forEach((addOption) => {
        if (option.value === addOption.value) {
          enumOptions[enumOptionsIndex] = addOption;
        }
        return option;
      });
      enumOptionsIndex++;
    });
    enumOptions.sort(function (left, right) {
      return left.hasOwnProperty('suggested') ? -1 : right.hasOwnProperty('suggested') ? 1 : 0;
    });
  }
  const selectAutoCompleteContext = useContext(SelectAutoCompleteContext);
  const { setLastFieldChanged, lastFieldChanged } = selectAutoCompleteContext;
  const optionValueLabels = {};
  const optionValueSuggested = {};

  const optionValues = Object.values(enumOptions).map((enumerated) => {
    const option = enumerated as OptionType;

    optionValueLabels[option.value] = option.label || option.title || option.value;
    optionValueSuggested[option.value] = option.suggested || false;
    return option.value;
  });
  const startingValue = props.value || '';
  const [value, setValue] = useState(startingValue);
  const [inputValue, setInputValue] = useState(startingValue ? optionValueLabels[startingValue] : '');

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

  const [renderKey, setRenderKey] = useState(props.id.toString() + Math.random());

  useEffect(() => {
    if (props.id.toString().includes('jurisdiction_code')) {
      setRenderKey(props.id.toString() + Math.random());
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
            <Box {...props} key={`rjsfSingleSelect${Math.random()}`} style={{ display: 'flex', flexDirection: 'row' }}>
              {optionValueSuggested[option] && <StarIcon style={{ fontSize: 15, marginRight: 7 }} color="warning" />}
              <Typography>
                {option ? optionValueLabels[option] : ''}
                {optionValueSuggested[option] && <i> - Suggested based on location</i>}
              </Typography>
            </Box>
          );
        }}
        selectOnFocus
        onFocus={(event) => {
          props.onFocus(event.target.id, event.target.nodeValue);
        }}
        isOptionEqualToValue={(option) => {
          if (option === value) {
            return true;
          } else if (value === '') {
            return true;
          }
        }}
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
