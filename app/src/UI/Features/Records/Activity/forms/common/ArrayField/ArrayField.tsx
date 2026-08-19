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
import DeleteControl from '../DeleteControl/DeleteControl';
import Button from 'UI/Reusable/Button/Button';
import { Add } from '@mui/icons-material';

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

  const {
    control,
    formState: { errors, disabled },
    trigger
  } = useFormContext<T>();

  const { fields, append, remove } = useFieldArray({ control, name, rules });
  const watchedValues = useWatch({ control, name: name as any });

  const debouncedTrigger = useCallback(
    debounce(() => {
      if (rules) trigger(name as any);
    }, TRIGGER_DELAY),
    [name, trigger, rules]
  );

  // Trigger Array level validation when any internal values change
  useEffect(() => {
    if (watchedValues) debouncedTrigger();
    return () => debouncedTrigger.cancel();
  }, [watchedValues, trigger, name]);

  const rootError = getNestedError(errors, name)?.root;
  return (
    <Fieldset nested label={label} tooltip={tooltip} width={width}>
      <div className="field-array">
        <div className="field-array-entries">
          {fields.map((field, index) => (
            <div key={field.id} className="field-array-row">
              {renderRow(index, remove)}
              <DeleteControl onClick={() => remove(index)} />
            </div>
          ))}
        </div>
        <div className="control">
          {rootError && <ErrorMessage error={rootError} label={label} />}
          <Button disabled={disabled} variant="none" className="add-entry" onClick={() => append(emptyValue)}>
            <Add /> Add {label}
          </Button>
        </div>
      </div>
    </Fieldset>
  );
}

export default ArrayField;
