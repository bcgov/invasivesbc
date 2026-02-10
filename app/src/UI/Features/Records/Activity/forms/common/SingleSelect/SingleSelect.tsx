import FormCode from 'interfaces/FormCode';
import './singleSelect.css';
import Select from 'react-select';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { Controller, FieldValues, useFormContext, Path } from 'react-hook-form';
import { RegisterOptions } from 'react-hook-form';
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
  width?: Width;
}

export function SingleSelect<T extends FieldValues>({
  label,
  name,
  options,
  placeholder = label,
  required = false,
  rules,
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
      render={({ field: { onChange, ref, value }, fieldState: { error } }) => {
        const mappedOptions = options.map((o) => ({
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
              isSearchable={mappedOptions?.length >= MIN_OPTIONS_TO_ENABLE_SEARCH}
              noOptionsMessage={() => 'No options available'}
              onChange={(opt) => onChange(opt?.value)}
              options={mappedOptions}
              placeholder={placeholder}
              ref={ref}
              value={mappedOptions.find((o) => o.value === (value?.code ?? value)) || null}
            />
            <ErrorMessage error={error} label={label} />
          </div>
        );
      }}
    />
  );
}

export default SingleSelect;
