import { useFormContext, useFieldArray, ArrayPath, FieldValues } from 'react-hook-form';
import Fieldset from '../Fieldset/Fieldset';
import './arrayField.css';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { Width } from '../utils';

interface PropTypes<T extends FieldValues> {
  emptyValue: any; // What to append when "Add" is clicked
  label: string;
  name: ArrayPath<T>;
  tooltip?: string;
  width?: Width;
  renderRow: (index: number, remove: (index: number) => void) => React.ReactNode;
}

export function ArrayField<T extends FieldValues>({
  emptyValue,
  label,
  name,
  renderRow,
  tooltip,
  width
}: PropTypes<T>) {
  const {
    control,
    formState: { errors }
  } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({ control, name });

  const rootError = (errors[name] as any)?.root;
  return (
    <Fieldset label={label} tooltip={tooltip} width={width}>
      <div className={'field-array'}>
        <div className="field-array-entries">
          {fields.map((field, index) => (
            <div key={field.id} className="field-array-row">
              {renderRow(index, remove)}
            </div>
          ))}
        </div>

        <ErrorMessage error={rootError} label={label} />
        <button type="button" className="add-entry" onClick={() => append(emptyValue)}>
          + Add {label}
        </button>
      </div>
    </Fieldset>
  );
}

export default ArrayField;
