import { Controller, FieldValues, Path, RegisterOptions, useFormContext } from 'react-hook-form';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import RequiredField from 'UI/Features/Records/Activity/forms/common/RequiredField/RequiredField';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import FormCode from 'interfaces/FormCode';
import AdvisoryMessage from 'UI/Features/Records/Activity/forms/common/AdvisoryMessage/AdvisoryMessage';
import './radioInput.css';

interface PropTypes<T extends FieldValues> {
  readonly label?: string;
  readonly name: Path<T>;
  readonly options: Array<FormCode>;
  readonly required?: boolean;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly tooltip?: string;
  readonly advisoryText?: string;
  readonly width?: Width;
}

export function RadioInput<T extends FieldValues>({
  label,
  name,
  options,
  required = false,
  rules,
  advisoryText,
  tooltip,
  width
}: PropTypes<T>) {
  const {
    control,
    formState: { disabled }
  } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        /**
         * @desc Transform bool strings back into booleans (radio inputs don't support)
         * @param val
         * @returns
         */
        const handleValueChange = (val: string) => {
          if (val === 'true') return onChange(true);
          if (val === 'false') return onChange(false);
          onChange(val);
        };
        return (
          <div className={`form-radio-input ${getInputWidth(width)}`}>
            {label && (
              <div className="top">
                <label>
                  {label}
                  {required && <RequiredField />}
                </label>
                {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
              </div>
            )}
            <ul className="options">
              {options.map((o) => {
                const optionValue = String(o.code);
                const isChecked = String(value) === optionValue;
                return (
                  <li key={optionValue}>
                    <input
                      type="radio"
                      disabled={disabled}
                      id={`${name}-${optionValue}`}
                      name={name}
                      value={optionValue}
                      checked={isChecked}
                      onChange={() => handleValueChange(optionValue)}
                      onBlur={onBlur}
                      ref={ref}
                    />
                    <label htmlFor={`${name}-${optionValue}`}>{o.full_name}</label>
                  </li>
                );
              })}
            </ul>
            <ErrorMessage error={error} label={label} />
            {advisoryText && <AdvisoryMessage text={advisoryText} />}
          </div>
        );
      }}
    />
  );
}

export default RadioInput;
