import './creatableSelect.css';
import Creatable from 'react-select/creatable';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { Controller, FieldValues, useFormContext, Path } from 'react-hook-form';
import { RegisterOptions } from 'react-hook-form';
import { getInputWidth, Width } from '../utils';
import RequiredField from '../RequiredField/RequiredField';

interface PropTypes<T extends FieldValues, TOption> {
  label?: string;
  name: Path<T>;
  options: Array<TOption>;
  labelKey: keyof TOption; // e.g., 'full_name' or 'full'
  valueKey: keyof TOption; // e.g., 'code' or 'short_id'
  placeholder?: string;
  required?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
  tooltip?: string;
  width?: Width;
}

export function CreatableSelect<T extends FieldValues, TOption>({
  label,
  name,
  options,
  labelKey,
  valueKey,
  placeholder = label,
  required = false,
  rules,
  tooltip,
  width
}: PropTypes<T, TOption>) {
  const { control } = useFormContext<T>();
  const handleCreateInput = (val: string) => console.log('handleCreateInput not Implemented. Value Received:', val);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, ref, value }, fieldState: { error } }) => {
        const getValue = () => {
          if (!value) return null;
          const actualValue = typeof value === 'object' ? value[valueKey] : value;
          return options.find((o) => o[valueKey] === actualValue) || null;
        };

        return (
          <div className={`form-creatable-select-input ${getInputWidth(width)}`}>
            {label && (
              <div className="top">
                <label htmlFor={name}>
                  {label} {required && <RequiredField />}
                </label>
                {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
              </div>
            )}
            <Creatable
              isMulti // Enable multi-select to match your array structure
              className="select-input"
              isSearchable
              isClearable
              options={options}
              getOptionLabel={(o: any) => o[labelKey]}
              getOptionValue={(o: any) => o[valueKey]}
              onChange={(val: any) => onChange(val ? val : [])}
              value={value || []}
              onCreateOption={(inputValue) => {
                const newOption = {
                  [labelKey]: inputValue,
                  [valueKey]: inputValue
                };
                onChange([...(value || []), newOption]);
              }}
              getNewOptionData={(inputValue, optionLabel) =>
                ({
                  [labelKey]: optionLabel,
                  [valueKey]: inputValue
                }) as any
              }
            />
            <ErrorMessage error={error} label={label} />
          </div>
        );
      }}
    />
  );
}

export default CreatableSelect;
