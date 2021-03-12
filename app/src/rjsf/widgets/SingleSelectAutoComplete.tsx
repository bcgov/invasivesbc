import React, {useState} from 'react';
import Checkbox from '@material-ui/core/Checkbox';
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
  const [value, setValue] = useState(enumOptions?.[0].value);
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <Autocomplete
        autoComplete
        autoSelect
        autoHighlight={true}
        id={props.id}
        disabled={props.disabled}
        disableClearable
        clearOnBlur={false}
        clearOnEscape={false}

        value={value}
        onChange={(event, selectedOption: AutoCompleteSelectOption) => {
          setValue(selectedOption?.value);
          setInputValue(selectedOption?.label);
          props.onChange(selectedOption);
        }}
        
        options={enumOptions}
        getOptionSelected={(option) => option?.label === inputValue}
        filterOptions={createFilterOptions({ limit: 50 })}
        getOptionLabel={(option) => option ? option.label : ''}
        renderOption={(option) => option ? option.label : ''}

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