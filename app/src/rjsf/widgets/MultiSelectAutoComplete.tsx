import { WidgetProps } from '@rjsf/utils';
import { Autocomplete, TextField } from '@mui/material';

interface SelectOption {
  label: string;
  value: unknown;
}
const MultiSelectAutoComplete = (props: WidgetProps) => {
  const enumOptions = props.schema.options?.map(({ value, label }) => ({ value, label })) ?? [];
  const selectedOptions = enumOptions.filter((opt) => {
    // restructure the CSV format of the prop
    const val = props.value?.split(',');
    return val?.includes(opt.value);
  });
  return (
    <Autocomplete
      multiple
      id={props.id}
      options={enumOptions}
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

export default MultiSelectAutoComplete;
