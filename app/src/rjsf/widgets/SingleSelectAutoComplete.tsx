import { createFilterOptions } from '@mui/material/Autocomplete';
import StarIcon from '@mui/icons-material/Star';
import { Typography, Box, TextField, Autocomplete } from '@mui/material';
import { SelectAutoCompleteContext } from 'contexts/SelectAutoCompleteContext';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { selectActivity } from 'state/reducers/activity';
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

const SingleSelectAutoComplete = (props: WidgetProps) => {
  const activityPageState = useSelector(selectActivity);
  const selectAutoCompleteContext = useContext(SelectAutoCompleteContext);
  const { setLastFieldChanged, lastFieldChanged } = selectAutoCompleteContext;
  const [value, setValue] = useState(props.value || '');

  const [optionsObject, setOptionsObject] = useState({
    optionValues: [],
    optionValueLabels: {},
    optionValueSuggested: {}
  });

  const [inputValue, setInputValue] = useState(value ? optionsObject.optionValueLabels[value] : '');

  useEffect(() => {
    if (props.schema.title === 'Jurisdiction') {
      console.log('oh no not again');
    }
    let enumOptions = // @ts-ignore
      (props.schema.options as AutoCompleteSelectOption[]) || (props.options.enumOptions as AutoCompleteSelectOption[]);

    if (!enumOptions) enumOptions = [];
    if (props.id.toString().includes('jurisdiction_code')) {
      const suggestedJurisdictions = activityPageState.suggestedJurisdictions
        ? activityPageState.suggestedJurisdictions
        : [];
      const additionalEnumOptions = [];
      if (props.schema.title === 'Jurisdiction') {
        console.log('about to loop through jurisdictios');
      }

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

      if (props.schema.title === 'Jurisdiction') {
        console.log('about to loop through enums');
      }

      enumOptions.forEach((option) => {
        additionalEnumOptions.forEach((addOption) => {
          if (option.value === addOption.value) {
            enumOptions[enumOptionsIndex] = addOption;
          }
          return option;
        });
        enumOptionsIndex++;
      });

      if (props.schema.title === 'Jurisdiction') {
        console.log('about to sort through enums');
      }
      enumOptions.sort(function (left, right) {
        return left.hasOwnProperty('suggested') ? -1 : right.hasOwnProperty('suggested') ? 1 : 0;
      });
    }
    let tempOptionValueLabels = {};
    let tempOptionValueSuggested = {};
    let tempOptionValues = Object.values(enumOptions).map((option) => {
      tempOptionValueLabels[option.value] = option.label || option.title || option.value;
      tempOptionValueSuggested[option.value] = (option as any).suggested || false;
      return option.value;
    });

    if (props.schema.title === 'Jurisdiction') {
      console.log('about to set options');
    }

    setOptionsObject({
      optionValues: [...tempOptionValues],
      optionValueLabels: { ...tempOptionValueLabels },
      optionValueSuggested: { ...tempOptionValueSuggested }
    });
  }, [JSON.stringify(activityPageState.suggestedJurisdictions), props.schema.options]);

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

  const OptionRenderedMemo = (props, option) => {
    return useMemo(() => {
      return <Box {...props} style={{ display: 'flex', flexDirection: 'row' }}>
              {optionsObject.optionValueSuggested[option] && (
                <StarIcon style={{ fontSize: 15, marginRight: 7 }} color="warning" />
              )}
              <Typography>
                {option ? optionsObject.optionValueLabels[option] : ''}
                {optionsObject.optionValueSuggested[option] && <i> - Suggested based on location</i>}
              </Typography>
            </Box>

    }, [JSON.stringify(option), JSON.stringify(optionsObject.optionValueLabels[option]), JSON.stringify(optionsObject.optionValueSuggested[option]) ]);
  };



  return (
    <div>
      <Autocomplete
        autoHighlight
        autoSelect={props.required}
        blurOnSelect
        openOnFocus
        renderOption={(props, option) => {
          //@ts-ignore
          return OptionRenderedMemo(props, option)
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
          props.onChange(props.value || '');
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
        options={optionsObject.optionValues}
        filterOptions={createFilterOptions({
          // limit: 500, // NOTE: removed for now, but might want with very long lists
          stringify: (option) => option + ' ' + optionsObject.optionValueLabels[option]
        })}
        getOptionLabel={(option) => {
          return optionsObject.optionValueLabels[option] ? optionsObject.optionValueLabels[option] : '';
        }}
        // inputValue={inputValue}
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
