import { createFilterOptions } from '@mui/material/Autocomplete';
import { TextField, Autocomplete, MenuItem } from '@mui/material';
import { SelectAutoCompleteContext } from 'UI/Features/Records/Activity/form/SelectAutoCompleteContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { nanoid } from '@reduxjs/toolkit';
import { useSelector } from 'utils/use_selector';
import { Role } from 'constants/roles';

// Custom type to support this widget
export type AutoCompleteSelectOption = {
  label: string;
  value: any;
  title: any;
  suggested?: boolean;
};

const EmployerSelectAutoComplete = (props: WidgetProps) => {
  const { setLastFieldChanged } = useContext(SelectAutoCompleteContext);
  if (!setLastFieldChanged) {
    throw new Error('Context not provided to EmployerSelectAutoComplete.tsx');
  }
  /**
   * @desc Converts an option value into an option label
   * @param value Code value
   * @returns Matching label, or value provided
   */
  const getLabelFromValue = (value: string): string =>
    filteredOptions.find((item) => item.value === value)?.label ?? value;

  const handleChange = (_, option: AutoCompleteSelectOption, reason: string) => {
    if (reason === 'clear') {
      setValue(null);
      props.onChange(undefined);
    } else {
      setValue(option);
      props.onChange(option.value ?? option);
    }
  };

  const usersEmployers = useSelector((state) => state.Auth?.extendedInfo?.employer)?.split(',') ?? [];
  const created_by = useSelector((state) => state.ActivityPage?.activity?.created_by);
  const currentSessionUsername = useSelector((state) => state.Auth?.username);
  const userIsMasterAdmin = useSelector((state) =>
    state.Auth.roles.some((r) => r.role_name === Role.MASTER_ADMINISTRATOR)
  );

  const filteredOptions: Array<AutoCompleteSelectOption> = useMemo(() => {
    const isEnums = props.options?.enumOptions && props.options.enumOptions.length > 0;
    const options = isEnums
      ? JSON.parse(JSON.stringify(props.options.enumOptions ?? []))
      : (JSON.parse(JSON.stringify(props?.schema?.options ?? [])) ?? []);
    const userShouldHaveFilteredOptions = currentSessionUsername === created_by && !userIsMasterAdmin;
    if (userShouldHaveFilteredOptions) {
      // If user fills out form for themselves, limit options to their assigned employers
      const limitedOptions = options.filter((o: AutoCompleteSelectOption) => usersEmployers.includes(o.value));
      return limitedOptions;
    }
    return options;
  }, [usersEmployers, currentSessionUsername, created_by, userIsMasterAdmin]);

  const [value, setValue] = useState(props.value ?? null);
  const [inputValue, setInputValue] = useState(getLabelFromValue(props.value ?? null));
  const [renderKey] = useState(props.id + nanoid());

  useEffect(() => {
    setLastFieldChanged({ id: props.id, option: value?.value ?? value });
  }, [value]);

  return (
    <Autocomplete
      autoHighlight
      autoSelect={props.required}
      blurOnSelect
      clearOnEscape={!props.required}
      disableClearable={props.required}
      disabled={props.disabled}
      filterOptions={createFilterOptions({
        stringify: (option) => `${option?.label} ${option?.value}`
      })}
      getOptionLabel={(option) => option.label ?? getLabelFromValue(option) ?? ''}
      id={props.id}
      inputValue={inputValue ?? ''}
      isOptionEqualToValue={(option) => !value || option.value === value || option.value === value.value}
      key={renderKey}
      onChange={handleChange}
      onFocus={(event) => props.onFocus(event.target.id, event.target.nodeValue)}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      openOnFocus
      options={filteredOptions}
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
          {option.label ?? ''}
        </MenuItem>
      )}
      selectOnFocus
      value={value ?? ''}
    />
  );
};

export default EmployerSelectAutoComplete;
