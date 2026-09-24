import { Controller, FieldValues, RegisterOptions, useFormContext, Path } from 'react-hook-form';
import Select from 'react-select';
import FormCode from 'interfaces/FormCode';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import './multiSelect.css';
import { useEffect, useMemo } from 'react';

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

            // selectedValue shape can be ['', ''] or [{}, {}]
            const selectedCodes =
              typeof selectedValue[0] === 'string' ? selectedValue : selectedValue.flatMap(Object.values);

            const createdActivityDate = new Date(`${activityDate}T00:00:00`);
            createdActivityDate.setHours(0, 0, 0, 0);

            let expiredCodes = '';

            for (const code of selectedCodes) {
              const option = options.find((option) => option.code === code);
              if (option?.valid_to) {
                const validToDate = new Date(option?.valid_to);
                validToDate.setHours(0, 0, 0, 0);

                if (validToDate < createdActivityDate) {
                  expiredCodes += `${option.full_name}, `;
                }
              }
            }

            if (expiredCodes.length !== 0) {
              return `The following codes expired past the activity date: ${expiredCodes.slice(0, -2)}`;
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

          const selectedValues = options
            ?.filter((o) => (valueKey ? value?.some?.((v) => v?.[valueKey] === o.code) : value?.includes(o.code)))
            ?.map((o) => ({ label: o.full_name, value: o.code }));

          const visibleOptions = options.filter((option) => {
            if (!option.valid_to) return true;

            // zero the valid_to date time since we only care about the actual date
            const validToDate = new Date(option.valid_to);
            validToDate.setHours(0, 0, 0, 0);

            const isValid = validToDate >= created;

            const isCurrentlySelected = selectedValues.some((selectedOpt) => selectedOpt.value === option.code);

            // displays the currently selected option even if it is expired
            return isValid || isCurrentlySelected;
          });

          return visibleOptions.map((o) => ({
            label: o.full_name,
            value: o.code
          }));
        }, [activityDate, options, value]);

        return (
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
              isSearchable={mappedOptions?.length >= MIN_OPTIONS_TO_ENABLE_SEARCH}
              options={mappedOptions}
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
        );
      }}
    />
  );
}

export default MultiSelect;
