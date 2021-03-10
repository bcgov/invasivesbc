import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { WidgetProps } from '@rjsf/core';
import React from 'react';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
  const enumOptions = props.options.enumOptions as AutoCompleteSelectOption[];

  /**
   * On a value selected or un-selected, call the parents onChange event to inform the form of the new value of the
   * widget.
   *
   * @param {React.ChangeEvent<{}>} event
   * @param {AutoCompleteSelectOption} value
   */
  const handleOnChange = (event: React.ChangeEvent<{}>, value: AutoCompleteSelectOption): void => {
    props.onChange(value);
  };

  /**
   * Custom comparator to determine if a given option is selected.
   *
   * @param {AutoCompleteSelectOption} option
   * @param {AutoCompleteSelectOption} value
   * @return {*}  {boolean}
   */
  const handleGetOptionSelected = (
    option: AutoCompleteSelectOption,
    value: AutoCompleteSelectOption
  ): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
  };

  return (
    <div>
      <Autocomplete
        multiple={false}
        autoHighlight={true}
        id={props.id}
        value={props.value}
        getOptionSelected={handleGetOptionSelected}
        disabled={props.disabled}
        options={enumOptions}
        // disableCloseOnSelect
        filterOptions={createFilterOptions({ limit: 50 })}
        getOptionLabel={(option) => option.label}
        onChange={handleOnChange}
        renderOption={(option) => option.label}
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