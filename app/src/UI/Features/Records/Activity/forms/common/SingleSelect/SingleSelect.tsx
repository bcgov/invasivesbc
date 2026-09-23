import FormCode from 'interfaces/FormCode';
import Select from 'react-select';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { Controller, FieldValues, RegisterOptions, useFormContext, Path } from 'react-hook-form';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import './singleSelect.css';
import { useEffect, useMemo } from 'react';

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
  required = false,
  rules,
  noOptionsMessage,
  tooltip,
  width
}: PropTypes<T>) {
  const MIN_OPTIONS_TO_ENABLE_SEARCH = 10;
  const { control, trigger, watch } = useFormContext<T>();
  const activityDate = watch('date' as Path<T>);

  useEffect(() => {
    if (activityDate) {
      trigger(name);
    }
  }, [activityDate, name, trigger]);

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        ...rules,
        validate: {
          ...rules?.validate,
          notExpired: (selectedValue) => {
            if (!selectedValue || !activityDate) return true;

            const code = selectedValue?.code ?? selectedValue;
            const selectedOption = options.find((option) => option.code === code);

            if (selectedOption?.valid_to) {
              const created = new Date(`${activityDate}T00:00:00`);
              created.setHours(0, 0, 0, 0);

              const validToDate = new Date(selectedOption.valid_to);
              validToDate.setHours(0, 0, 0, 0);

              if (validToDate < created) {
                return 'Code is expired passed the activity date';
              }
            }
            return true;
          }
        }
      }}
      render={({ field: { onChange, ref, disabled, value }, fieldState: { error } }) => {
        const mappedOptions = useMemo(() => {
          if (!activityDate) {
            return options.map((o) => ({ label: o.full_name, value: o.code }));
          }

          // zero the created date time since we only care about the actual date
          const created = new Date(`${activityDate}T00:00:00`);
          created.setHours(0, 0, 0, 0);

          const selectedValue = value?.code ?? value;

          const visibleOptions = options.filter((option) => {
            if (!option.valid_to) return true;

            // zero the valid_to date time since we only care about the actual date
            const validToDate = new Date(option.valid_to);
            validToDate.setHours(0, 0, 0, 0);

            const isValid = validToDate >= created;
            const isCurrentlySelected = option.code === selectedValue;

            return isValid || isCurrentlySelected;
          });

          return visibleOptions.map((o) => ({
            label: o.full_name,
            value: o.code
          }));
        }, [activityDate, options, value]);

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
              isSearchable={mappedOptions?.length >= MIN_OPTIONS_TO_ENABLE_SEARCH}
              noOptionsMessage={() => noOptionsMessage ?? 'No options available'}
              onChange={(opt) => onChange(opt?.value ?? '')}
              options={mappedOptions}
              placeholder={disabled ? '' : 'Select...'}
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
