import { useFormContext, useFieldArray, ArrayPath, FieldValues } from 'react-hook-form';
import Fieldset from '../Fieldset/Fieldset';
import './arrayField.css';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

interface PropTypes<T extends FieldValues> {
  name: ArrayPath<T>;
  label: string;
  emptyValue: any; // What to append when "Add" is clicked
  renderRow: (index: number, remove: (index: number) => void) => React.ReactNode;
}

export function ArrayField<T extends FieldValues>({ name, label, emptyValue, renderRow }: PropTypes<T>) {
  const {
    control,
    formState: { errors }
  } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({ control, name });

  const rootError = (errors[name] as any)?.root;
  return (
    <Fieldset small label={label}>
      <div className="field-array">
        <div className="field-array-entries">
          {fields.map((field, index) => (
            <div key={field.id} className="field-array-row">
              {renderRow(index, remove)}
            </div>
          ))}
        </div>

        {rootError && <ErrorMessage message={rootError.message} />}
        <button type="button" className="add-entry" onClick={() => append(emptyValue)}>
          + Add {label}
        </button>
      </div>
    </Fieldset>
  );
}

export default ArrayField;
