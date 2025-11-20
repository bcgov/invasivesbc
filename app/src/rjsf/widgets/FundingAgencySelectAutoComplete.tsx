import { WidgetProps } from '@rjsf/utils';
import { Autocomplete, TextField } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import { Role } from 'constants/roles';
import { useMemo } from 'react';

interface SelectOption {
  label: string;
  value: unknown;
}
const FundingAgencySelectAutoComplete = (props: WidgetProps) => {
  const usersFundingAgencies = useSelector((state) => state.Auth?.extendedInfo?.funding_agencies)?.split(',') ?? [];
  const created_by = useSelector((state) => state.ActivityPage?.activity?.created_by);
  const currentSessionUsername = useSelector((state) => state.Auth?.username);
  const userIsMasterAdmin = useSelector((state) =>
    state.Auth.roles.some((r) => r.role_name === Role.MASTER_ADMINISTRATOR)
  );

  const filteredOptions = useMemo(() => {
    const enumOptions = props.schema.options?.map(({ value, label }) => ({ value, label })) ?? [];
    if (created_by === currentSessionUsername && !userIsMasterAdmin) {
      // If user fills out form for themselves, limit options to their assigned employers
      return enumOptions.filter((o) => usersFundingAgencies.includes(o.value));
    }
    return enumOptions;
  }, [created_by, currentSessionUsername, userIsMasterAdmin, usersFundingAgencies]);

  const selectedOptions = filteredOptions.filter((opt) => {
    // restructure the CSV format of the prop
    const val = props.value?.split(',');
    return val?.includes(opt.value);
  });

  return (
    <Autocomplete
      multiple
      id={props.id}
      options={filteredOptions}
      value={selectedOptions}
      onChange={(_, newValue: SelectOption[]) => {
        // Maintain the value as CSV. Set undefined if new value is empty array.
        props.onChange(newValue.length > 0 ? newValue.map((opt) => opt.value).join(',') : undefined);
      }}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      disabled={props.disabled || props.readonly}
      renderInput={(params) => <TextField {...params} required={props.required} label={props.label} />}
    />
  );
};

export default FundingAgencySelectAutoComplete;
