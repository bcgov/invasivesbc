import FormCode from 'interfaces/FormCode';
import './singleSelect.css';
import Select from 'react-select';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { Controller, FieldValues, useFormContext, Path } from 'react-hook-form';
import { RegisterOptions } from 'react-hook-form';
import { getInputWidth, Width } from '../utils';

interface PropTypes<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  options: Array<FormCode>;
  rules?: RegisterOptions<T, Path<T>>;
  isSearchable?: boolean;
  tooltip?: string;
  placeholder?: string;
  width?: Width;
}

export function SingleSelect<T extends FieldValues>({
  name,
  label,
  options,
  rules,
  isSearchable = false,
  tooltip,
  placeholder = label,
  width
}: PropTypes<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, ref }, fieldState: { error } }) => (
        <div className={`form-single-select-input ${getInputWidth(width)}`}>
          {label && (
            <label htmlFor={name}>
              {label} {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
            </label>
          )}
          <Select
            ref={ref}
            placeholder={placeholder}
            isSearchable={isSearchable}
            options={options.map((o) => ({ label: o.full_name, value: o.code }))}
            onChange={onChange}
            className="select-input"
            noOptionsMessage={() => <option>No options available</option>}
          />
          <ErrorMessage error={error} label={label} />
        </div>
      )}
    />
  );
}

export default SingleSelect;
