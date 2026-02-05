import { Controller, FieldValues, useFormContext, Path } from 'react-hook-form';
import Select from 'react-select';
import { RegisterOptions } from 'react-hook-form';
import FormCode from 'interfaces/FormCode';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './MultiSelect.css';
import { getInputWidth, Width } from '../utils';

interface PropTypes<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  options: Array<FormCode>;
  rules?: RegisterOptions<T, Path<T>>;
  isSearchable?: boolean;
  tooltip?: string;
  width?: Width;
  placeholder?: string;
}

export function MultiSelect<T extends FieldValues>({
  name,
  label,
  options,
  rules,
  isSearchable = false,
  tooltip,
  placeholder,
  width
}: PropTypes<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, ref }, fieldState: { error } }) => (
        <div className={`form-multi-select-input ${getInputWidth(width)}`}>
          {label && (
            <label htmlFor={name}>
              {label} {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
            </label>
          )}
          <Select
            ref={ref}
            isMulti
            placeholder={placeholder}
            isSearchable={isSearchable}
            options={options.map((o) => ({ label: o.full_name, value: o.code }))}
            onChange={(val) => onChange(val.map((c) => c.value))}
            className="select-input"
          />
          <ErrorMessage error={error} />
        </div>
      )}
    />
  );
}

export default MultiSelect;
