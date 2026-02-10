import { Controller, FieldValues, useFormContext, Path } from 'react-hook-form';
import Select from 'react-select';
import { RegisterOptions } from 'react-hook-form';
import FormCode from 'interfaces/FormCode';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './MultiSelect.css';
import { getInputWidth, Width } from '../utils';
import RequiredField from '../RequiredField/RequiredField';

interface PropTypes<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  options: Array<FormCode>;
  placeholder?: string;
  required?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
  tooltip?: string;
  valueKey?: string;
  width?: Width;
}

export function MultiSelect<T extends FieldValues>({
  label,
  name,
  options,
  placeholder,
  required = false,
  rules,
  tooltip,
  valueKey,
  width
}: PropTypes<T>) {
  const MIN_OPTIONS_TO_ENABLE_SEARCH = 10;
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
        <div className={`form-multi-select-input ${getInputWidth(width)}`}>
          {label && (
            <label htmlFor={name}>
              {label} {required && <RequiredField />} {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
            </label>
          )}
          <Select
            ref={ref}
            isMulti
            placeholder={placeholder}
            isSearchable={options?.length >= MIN_OPTIONS_TO_ENABLE_SEARCH}
            options={options.map((o) => ({ label: o.full_name, value: o.code }))}
            value={options
              .filter((o) => (valueKey ? value?.some((v) => v?.[valueKey] === o.code) : value?.includes(o.code)))
              .map((o) => ({ label: o.full_name, value: o.code }))}
            onChange={(val) => onChange(valueKey ? val.map((c) => ({ [valueKey]: c.value })) : val.map((c) => c.value))}
            className="select-input"
          />
          <ErrorMessage error={error} />
        </div>
      )}
    />
  );
}

export default MultiSelect;
