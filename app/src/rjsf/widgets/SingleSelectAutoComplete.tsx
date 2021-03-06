import React, { useContext, useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { WidgetProps } from '@rjsf/core';
import { SelectAutoCompleteContext } from 'contexts/SelectAutoCompleteContext';
import { setISODay } from 'date-fns/esm';

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
  let enumOptions = props.options.enumOptions as AutoCompleteSelectOption[];
  if (!enumOptions) enumOptions = [];
  const selectAutoCompleteContext = useContext(SelectAutoCompleteContext);
  const { setLastFieldChanged, lastFieldChanged } = selectAutoCompleteContext;
  let optionValueLabels = {};
  let optionValues = Object.values(enumOptions).map((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
    return option.value;
  });
  const startingValue = props.value || '';
  const [value, setValue] = useState(startingValue);
  const [inputValue, setInputValue] = useState(startingValue ? optionValueLabels[startingValue] : '');
  const [event, setEvent] = useState(null);

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
  }, [lastFieldChanged]);

  useEffect(() => {
    setLastFieldChanged({ id: props.id, option: value });
  }, [event]);

  return (
    <div>
      <Autocomplete
        autoComplete
        autoHighlight
        autoSelect={props.required}
        blurOnSelect
        openOnFocus
        selectOnFocus
        onFocus={(event) => {
          props.onFocus(event.target.id, event.target.nodeValue);
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
            setEvent(event);

            // NOTE: passing string value to onChange, which might be expecting format
            // object: { value, label }
            // this will likely result in future compatibility errors with custom onChange functions
            // but can't change this easily without creating many validation errors
            props.onChange(option);
          }
        }}
        options={optionValues}
        getOptionSelected={(option) => option === value}
        filterOptions={createFilterOptions({
          // limit: 500, // NOTE: removed for now, but might want with very long lists
          stringify: (option) => option + ' ' + optionValueLabels[option]
        })}
        getOptionLabel={(option) => (option ? optionValueLabels[option] : '')}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
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
