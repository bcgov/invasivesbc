import {
  useFormContext,
  useFieldArray,
  FieldValues,
  UseFieldArrayProps,
  FieldArrayPath,
  useWatch
} from 'react-hook-form';
import Fieldset from '../Fieldset/Fieldset';
import './arrayField.css';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { Width } from '../utils';
import { useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';

// FieldArrayPath ensures the name provided is specifically a valid array path
interface PropTypes<T extends FieldValues, Name extends FieldArrayPath<T>> {
  emptyValue: any;
  label: string;
  name: Name;
  rules?: UseFieldArrayProps<T, Name>['rules'];
  tooltip?: string;
  width?: Width;
  renderRow: (index: number, remove: (index: number) => void) => React.ReactNode;
}
const TRIGGER_DELAY = 500; //ms
export function ArrayField<T extends FieldValues, Name extends FieldArrayPath<T>>({
  emptyValue,
  label,
  name,
  renderRow,
  rules,
  tooltip,
  width
}: PropTypes<T, Name>) {
  /**
   * Ensures access to errors whether top level, or in a sub state (represented by dot notation)
   */
  const getNestedError = (errorObj: any, name: string) =>
    name.split('.').reduce((acc, part) => acc && acc[part], errorObj);

  const debouncedTrigger = useCallback(
    debounce(() => trigger(name as any), TRIGGER_DELAY),
    []
  );
  const {
    control,
    formState: { errors, disabled },
    trigger
  } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({ control, name, rules });
  const watchedValues = useWatch({ control, name: name as any });

  // Trigger Array level validation when any internal values change
  useEffect(() => {
    if (watchedValues) debouncedTrigger();
  }, [watchedValues, trigger, name]);

  const rootError = getNestedError(errors, name)?.root;
  return (
    <Fieldset label={label} tooltip={tooltip} width={width}>
      <div className="field-array">
        <div className="field-array-entries">
          {fields.map((field, index) => (
            <div key={field.id} className="field-array-row">
              {renderRow(index, remove)}
            </div>
          ))}
        </div>
        <button disabled={disabled} type="button" className="add-entry" onClick={() => append(emptyValue)}>
          + Add {label}
        </button>
        {rootError && <ErrorMessage error={rootError} label={label} />}
      </div>
    </Fieldset>
  );
}

export default ArrayField;
