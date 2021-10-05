import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { UiSchema, WidgetProps } from '@rjsf/core';
import { enumKeys } from 'contexts/DatabaseContext2';
import React from 'react';
import { MultipleSelect } from 'react-select-material-ui';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// Custom type to support this widget
export type AutoCompleteMultiSelectOption = { label: string; value: any };

/**
 * A widget that supports a multi-select dropdown field with search filtering.
 *
 * Example schemas:
 *
 * JSON-Schema:
 *
 * ```JSON
 * {
 *   type: 'array',
 *   title: 'Multi Select Field Title',
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
 * uiSchema (assuming you register the widget as `multi-select-autocomplete`:
 *
 * ```JSON
 * {
 *   'ui:widget': 'multi-select-autocomplete'
 * }
 * ```
 *
 * @param {WidgetProps} props standard RJSF widget props
 * @return {*}
 */
const MultiSelectAutoComplete = (props: WidgetProps) => {
  const enumDisabled = props.options.enumDisabled;
  const enumOptions = props.options.enumOptions as any[];
  console.log(enumOptions);
  // const [current, setCurrent] = useState(null);
  // const [currentValue, setCurrentValue] = useState([]);
  /**
   * On a value selected or un-selected, call the parents onChange event to inform the form of the new value of the
   * widget.
   *
   * @param {React.ChangeEvent<{}>} event
   * @param {AutoCompleteMultiSelectOption[]} value
   */
  const handleOnChange = (value: any[]): void => {
    const newValue: any[] = [];
    value.forEach((item) => {
      newValue.push(item.value);
    });
    props.onChange(newValue.toString());
  };

  // /**
  //  * Custom comparator to determine if a given option is selected.
  //  *
  //  * @param {AutoCompleteMultiSelectOption} option
  //  * @param {AutoCompleteMultiSelectOption} value
  //  * @return {*}  {boolean}
  //  */
  // const handleGetOptionSelected = (
  //   option: AutoCompleteMultiSelectOption,
  //   value: AutoCompleteMultiSelectOption
  // ): boolean => {
  //   if (!option?.value || !value?.value) {
  //     return false;
  //   }
  //   return option.value === value.value;
  // };

  /**
   * Parses an existing array of values into an array of options.
   *
   * @return {*}  {AutoCompleteMultiSelectOption[]}
   */
  const getExistingValue = (): string[] => {
    if (!props.value) {
      return [];
    }
    let retVal;
    retVal = enumOptions.filter((option) => props.value.includes(option.value));
    return retVal;
  };

  // const getOptions = () => {
  //   const optionArr: string[] = [];

  //   for (const key of enumKeys(enumOptions)) {
  //     optionArr.push(enumOptions[key]);
  //   }

  //   return optionArr;
  // };
  let optionArr: NonNullable<UiSchema['ui:options']>;
  enumOptions.forEach(({ value, label }) => {
    optionArr.push({ value: label });
  });

  // const handleSelection = (values, name) => this.setState({ [name]: values });

  const dataSourceNodes = enumOptions.map(({ value, label }) => <div key={value}>{label}</div>);

  return (
    <MultiSelectAutoComplete onChange={handleOnChange} value={getExistingValue} options={optionArr} />
    // <Autocomplete
    //   multiple
    //   autoHighlight={true}
    //   id={props.id}
    //   value={getExistingValue()}
    //   getOptionSelected={handleGetOptionSelected}
    //   disabled={props.disabled}
    //   options={enumOptions}
    //   disableCloseOnSelect
    //   filterOptions={createFilterOptions({ limit: 50 })}
    //   getOptionLabel={(option) => option.label}
    //   onChange={handleOnChange}
    //   renderOption={(option, { selected }) => {
    //     const disabled: any = enumDisabled && (enumDisabled as any).indexOf(option.value) !== -1;
    //     return (
    //       <>
    //         <Checkbox
    //           icon={icon}
    //           checkedIcon={checkedIcon}
    //           style={{ marginRight: 8 }}
    //           checked={selected}
    //           disabled={disabled}
    //           value={option.value}
    //         />
    //         {option.label}
    //       </>
    //     );
    //   }}
    //   renderInput={(params) => (
    //     <TextField
    //       {...params}
    //       variant="outlined"
    //       required={props.required}
    //       label={props.label || props.schema.title}
    //       placeholder={'Begin typing to filter results...'}
    //     />
    //   )}
    // />
  );
};

export default MultiSelectAutoComplete;
