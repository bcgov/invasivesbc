import { createFilterOptions } from '@mui/material/Autocomplete';
import StarIcon from '@mui/icons-material/Star';
import { TextField, Autocomplete, MenuItem } from '@mui/material';
import { SelectAutoCompleteContext } from 'UI/Overlay/Records/Activity/form/SelectAutoCompleteContext';
import { useContext, useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { useSelector } from 'utils/use_selector';
import { nanoid } from '@reduxjs/toolkit';
import handleSuggestedJurisdictions from 'rjsf/business-rules/handleSuggestedJurisdictions';

// Custom type to support this widget
export type AutoCompleteSelectOption = {
  label: string;
  value: any;
  title: any;
  suggested?: boolean;
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
  const selectAutoCompleteContext = useContext(SelectAutoCompleteContext);
  if (!selectAutoCompleteContext) {
    throw new Error('Context not provided to SingleSelectAutoComplete.tsx');
  }

  /**
   * @desc Gets list of select options provided
   * @returns {AutoCompleteSelectOption[]} Select options for input field
   */
  const getListOptions = (): AutoCompleteSelectOption[] => {
    const isEnums = props.options?.enumOptions && props.options.enumOptions.length > 0;
    return isEnums
      ? JSON.parse(JSON.stringify(props.options.enumOptions ?? []))
      : (JSON.parse(JSON.stringify(props?.schema?.options ?? [])) ?? []);
  };

  /**
   * @desc Converts an option value into an option label
   * @param value Code value
   * @returns Matching label, or value provided
   */
  const getLabelFromValue = (value: string): string => listOptions.find((item) => item.value === value)?.label ?? value;

  const suggestedJurisdictionsInState = useSelector((state) => state.ActivityPage.suggestedJurisdictions);
  const { setLastFieldChanged, lastFieldChanged } = selectAutoCompleteContext;

  const [listOptions] = useState<AutoCompleteSelectOption[]>(getListOptions());
  const [value, setValue] = useState(props.value ?? null);
  const [inputValue, setInputValue] = useState(getLabelFromValue(props.value ?? null));
  const [renderKey, setRenderKey] = useState(props.id + nanoid());

  useEffect(() => {
    if (!lastFieldChanged?.id) {
      return;
    }
    if (
      lastFieldChanged?.id?.includes('slope_code') &&
      lastFieldChanged?.option?.includes('FL') &&
      props.id.includes('aspect_code')
    ) {
      setValue('FL');
    }
    if (
      lastFieldChanged?.id?.includes('aspect_code') &&
      lastFieldChanged?.option?.includes('FL') &&
      props.id.includes('slope_code')
    ) {
      setValue('FL');
    }
  }, [lastFieldChanged, props.id]);

  useEffect(() => {
    setLastFieldChanged({ id: props.id, option: value?.value ?? value });
  }, [value]);

  useEffect(() => {
    if (props.id.includes('jurisdiction_code')) {
      setRenderKey(props.id + nanoid());
    }
  }, [JSON.stringify(suggestedJurisdictionsInState)]);

  if (props.id.includes('jurisdiction_code')) {
    handleSuggestedJurisdictions(suggestedJurisdictionsInState, listOptions);
  }
  return (
    <Autocomplete
      autoHighlight
      autoSelect={props.required}
      blurOnSelect
      clearOnBlur={false}
      clearOnEscape={!props.required}
      disableClearable={props.required}
      disabled={props.disabled}
      filterOptions={createFilterOptions({
        // limit: 500, // NOTE: removed for now, but might want with very long lists
        stringify: (option) => `${option?.label} ${option?.value}`
      })}
      getOptionLabel={(option) => option.label ?? getLabelFromValue(option) ?? ''}
      id={props.id}
      inputValue={inputValue ?? ''}
      isOptionEqualToValue={(option) => !value || option.value === value || option.value === value.value}
      key={renderKey}
      onChange={(event: any, option: AutoCompleteSelectOption, reason: string) => {
        if (reason === 'clear') {
          // NOTE: currently disabled.
          setValue(null);
          props.onChange(null);
        } else {
          setValue(option);
          props.onChange(option.value ?? option);
        }
      }}
      onFocus={(event) => props.onFocus(event.target.id, event.target.nodeValue)}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      openOnFocus
      options={listOptions}
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
      renderOption={(props, option) => (
        <MenuItem {...props} key={`rjsfSingleSelect${nanoid()}`}>
          {option.suggested && <StarIcon style={{ fontSize: 15, marginRight: 7 }} color="warning" />}
          {option.label ?? ''}
          {option.suggested && <i> - Suggested based on location</i>}
        </MenuItem>
      )}
      selectOnFocus
      value={value ?? ''}
    />
  );
};

export default SingleSelectAutoComplete;
