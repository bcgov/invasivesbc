import { forwardRef, InputHTMLAttributes } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import './dateInput.css';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  includeTime?: boolean;
  name: string;
  label?: string;
  tooltip?: string;
  required?: boolean;
  width?: Width;
  rules: object;
}

// Use forwardRef so Hook Form can manage the input focus
const DateInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ includeTime = false, width, name, label, rules, required = false, tooltip, ...props }) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, ref, disabled, value }, fieldState: { error } }) => {
          const toInputValue = (val: unknown) => {
            try {
              if (!val) return '';
              if (!includeTime) return Temporal.PlainDate.from(val as string).toString();
              return Temporal.Instant.from(val as string)
                .toZonedDateTimeISO(Temporal.Now.timeZoneId())
                .toPlainDateTime()
                .toString({ smallestUnit: 'minute' });
            } catch {
              return '';
            }
          };
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            if (!raw) {
              if (e.target.validity.badInput) return; // partially typed, don't wipe it
            } else if (!includeTime) {
              onChange(raw);
            } else {
              onChange(
                Temporal.PlainDateTime.from(raw)
                  .toZonedDateTime(Temporal.Now.timeZoneId())
                  .toString({ timeZoneName: 'never' })
              );
            }
            props?.onChange?.(e);
          };
          return (
            <div className={`form-date-input ${getInputWidth(width)}`}>
              {label && (
                <div className="top">
                  <label>
                    {label}
                    {!required && <OptionalField />}
                  </label>
                  {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
                </div>
              )}
              <input
                {...props}
                name={name}
                ref={ref}
                onChange={handleChange}
                disabled={disabled}
                value={toInputValue(value)}
                type={includeTime ? 'datetime-local' : 'date'}
                aria-invalid={!!error}
              />
              <ErrorMessage error={error} label={label} />
            </div>
          );
        }}
      />
    );
  }
);

export default DateInput;
