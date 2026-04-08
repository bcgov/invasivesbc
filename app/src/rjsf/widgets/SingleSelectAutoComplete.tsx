import { createFilterOptions } from '@mui/material/Autocomplete';
import StarIcon from '@mui/icons-material/Star';
import {
  TextField,
  Autocomplete,
  MenuItem,
  Select,
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText
} from '@mui/material';
import { SelectAutoCompleteContext } from 'UI/Features/Records/Activity/form/SelectAutoCompleteContext';
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
  const MIN_ITEMS_FOR_SEARCH = 10;
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
    const FLAT_CODE = 'FL';
    if (!lastFieldChanged?.id) {
      return;
    }
    if (
      lastFieldChanged?.id?.includes('slope_code') &&
      lastFieldChanged?.option?.includes(FLAT_CODE) &&
      props.id.includes('aspect_code')
    ) {
      setValue(FLAT_CODE);
      props.onChange(FLAT_CODE);
    }
    if (
      lastFieldChanged?.id?.includes('aspect_code') &&
      lastFieldChanged?.option?.includes(FLAT_CODE) &&
      props.id.includes('slope_code')
    ) {
      setValue(FLAT_CODE);
      props.onChange(FLAT_CODE);
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
  if (listOptions.length < MIN_ITEMS_FOR_SEARCH) {
    return (
      <FormControl fullWidth variant="outlined" disabled={props.disabled || props.readonly} required={props.required}>
        <InputLabel id={`${props.id}-label`}>{props.label || props.schema.title}</InputLabel>
        <Select
          labelId={`${props.id}-label`}
          id={props.id}
          value={value ?? ''}
          onChange={(evt) => {
            const value = evt.target.value ?? undefined;
            setValue(value);
            props.onChange(value);
          }}
          onBlur={() => props.onBlur(props.id, value)}
          onFocus={() => props.onFocus(props.id, value)}
          input={<OutlinedInput label={props.label || props.schema.title} />}
          displayEmpty={!!props.placeholder}
          sx={{
            '& .MuiSelect-select': {
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          {listOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {/* Keeping your "Suggested" logic if applicable to the data */}
              {option.suggested && <StarIcon style={{ fontSize: 15, marginRight: 7 }} color="warning" />}
              {option.label}
              {option.suggested && <i style={{ marginLeft: 8, opacity: 0.7 }}> - Suggested based on location</i>}
            </MenuItem>
          ))}
        </Select>
        {props.schema.description && <FormHelperText>{props.schema.description}</FormHelperText>}
      </FormControl>
    );
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
      onChange={(_, option: AutoCompleteSelectOption, reason: string) => {
        if (reason === 'clear') {
          // NOTE: currently disabled.
          setValue(null);
          props.onChange(undefined);
        } else {
          setValue(option);
          props.onChange(option.value ?? option);
        }
      }}
      onFocus={(event) => props.onFocus(event.target.id, event.target.nodeValue)}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
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
