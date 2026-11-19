import getInputWidth from 'UI/Features/Records/Activity/forms/common/utils/getInputWidth'; // move to common utils
import { Controller, FieldValues, Path, RegisterOptions, useFormContext } from 'react-hook-form';
import Width from 'UI/Features/Records/Activity/forms/common/utils/Width';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import TooltipWithIcon from '../TooltipWithIcon/TooltipWithIcon';
import Select from 'react-select';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import './genericSingleSelect.css';

interface PropTypes<T extends FieldValues> {
  readonly label?: string;
  readonly name: Path<T>;
  readonly options: Array<{ value: string; label: string }>;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly noOptionsMessage?: string;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly tooltip?: string;
  readonly width?: Width;
}

/**
 * @desc Generic single select component that can be used in any form without creating a code table.
 */
export function GenericSingleSelect<T extends FieldValues>({
  label,
  name,
  options,
  required = false,
  rules,
  noOptionsMessage,
  tooltip,
  width
}: PropTypes<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, ref, disabled, value }, fieldState: { error } }) => {
        return (
          <div className={`form-single-select-input ${getInputWidth(width)}`}>
            {label && (
              <div className="top">
                <label htmlFor={name}>
                  {label}
                  {!required && <OptionalField />}
                </label>
                {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
              </div>
            )}
            <Select
              className="select-input"
              classNamePrefix={'select-input'}
              inputId={name}
              isDisabled={disabled}
              noOptionsMessage={() => noOptionsMessage ?? 'No options available'}
              onChange={(opt) => onChange(opt?.value ?? '')}
              options={options}
              placeholder={disabled ? '' : 'Select...'}
              ref={ref}
              isClearable
              aria-invalid={!!error}
              value={options?.find((o) => o.value === value) || null}
            />
            <ErrorMessage error={error} label={label} />
          </div>
        );
      }}
    />
  );
}
