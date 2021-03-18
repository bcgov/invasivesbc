import React, {useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { WidgetProps } from '@rjsf/core';

// Custom type to support this widget
export type AutoCompleteSelectOption = { label: string; value: any };

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
  if (!enumOptions)
    enumOptions = [];

  let optionValueLabels = {};
  let optionValues = Object.values(enumOptions).map((option) => {
    optionValueLabels[option.value] = option.label;
    return option.value;
  });
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <Autocomplete
        autoComplete
        autoSelect
        autoHighlight
        blurOnSelect
        openOnFocus
        selectOnFocus
        clearOnEscape
        id={props.id}
        disabled={props.disabled}
        disableClearable
        clearOnBlur={false}

        value={value}
        onChange={(event, option: string) => {
          setValue(option);
          // NOTE: passing value to onChange, which might be expecting format
          // { value, label }
          // can't change this without creating many validation errors
          props.onChange(option);
        }}
        
        options={optionValues}
        getOptionSelected={(option) => option === value}
        filterOptions={createFilterOptions({
          limit: 50,
          stringify: (option) => option + ' ' + optionValueLabels[option]
        })}
        getOptionLabel={(option) => optionValueLabels[option]}

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
}

export default SingleSelectAutoComplete;