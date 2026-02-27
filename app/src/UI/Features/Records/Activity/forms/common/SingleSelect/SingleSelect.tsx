import FormCode from 'interfaces/FormCode';
import './singleSelect.css';
import Select from 'react-select';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { Controller, FieldValues, RegisterOptions, useFormContext, Path } from 'react-hook-form';
import { getInputWidth, Width } from '../utils';
import RequiredField from '../RequiredField/RequiredField';

interface PropTypes<T extends FieldValues> {
  readonly label?: string;
  readonly name: Path<T>;
  readonly options: Array<FormCode>;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly noOptionsMessage?: string;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly tooltip?: string;
  readonly width?: Width;
}

export function SingleSelect<T extends FieldValues>({
  label,
  name,
  options,
  placeholder = label,
  required = false,
  rules,
  noOptionsMessage,
  tooltip,
  width
}: PropTypes<T>) {
  const MIN_OPTIONS_TO_ENABLE_SEARCH = 10;
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, ref, disabled, value }, fieldState: { error } }) => {
        const mappedOptions = options?.map((o) => ({
          label: o.full_name,
          value: o.code
        }));
        return (
          <div className={`form-single-select-input ${getInputWidth(width)}`}>
            {label && (
              <div className="top">
                <label htmlFor={name}>
                  {label}
                  {required && <RequiredField />}
                </label>
                {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
              </div>
            )}
            <Select
              className="select-input"
              isDisabled={disabled}
              isSearchable={mappedOptions?.length >= MIN_OPTIONS_TO_ENABLE_SEARCH}
              noOptionsMessage={() => noOptionsMessage ?? 'No options available'}
              onChange={(opt) => onChange(opt?.value ?? '')}
              options={mappedOptions}
              placeholder={placeholder}
              ref={ref}
              isClearable
              aria-invalid={!!error}
              value={mappedOptions?.find((o) => o.value === (value?.code ?? value)) || null}
            />
            <ErrorMessage error={error} label={label} />
          </div>
        );
      }}
    />
  );
}

export default SingleSelect;
