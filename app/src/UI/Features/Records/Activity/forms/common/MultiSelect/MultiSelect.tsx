import { Controller, FieldValues, RegisterOptions, useFormContext, Path } from 'react-hook-form';
import Select from 'react-select';
import FormCode from 'interfaces/FormCode';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import './multiSelect.css';

interface PropTypes<T extends FieldValues> {
  readonly label?: string;
  readonly name: Path<T>;
  readonly options: Array<FormCode>;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly tooltip?: string;
  readonly valueKey?: string;
  readonly width?: Width;
}

export function MultiSelect<T extends FieldValues>({
  label,
  name,
  options,
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
      render={({ field: { onChange, ref, disabled, value }, fieldState: { error } }) => (
        <div className={`form-multi-select-input ${getInputWidth(width)}`}>
          <div className="top">
            <label htmlFor={name}>
              {label}
              {!required && <OptionalField />}
            </label>
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </div>
          <Select
            ref={ref}
            isMulti
            isDisabled={disabled}
            aria-invalid={!!error}
            placeholder={disabled ? '' : 'Select one or more...'}
            isSearchable={options?.length >= MIN_OPTIONS_TO_ENABLE_SEARCH}
            options={options?.map((o) => ({ label: o.full_name, value: o.code })) ?? []}
            value={options
              ?.filter((o) => (valueKey ? value?.some?.((v) => v?.[valueKey] === o.code) : value?.includes(o.code)))
              ?.map((o) => ({ label: o.full_name, value: o.code }))}
            onChange={(val) =>
              onChange(valueKey ? val?.map((c) => ({ [valueKey]: c.value })) : val?.map((c) => c.value))
            }
            className="select-input"
            classNamePrefix={'select-input'}
          />
          <ErrorMessage error={error} label={label} />
        </div>
      )}
    />
  );
}

export default MultiSelect;
