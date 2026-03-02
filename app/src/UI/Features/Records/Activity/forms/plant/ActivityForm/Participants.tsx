import { useFormContext } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import { minArrayLength, minValue } from '../../common/validators';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import getDefaultFormState from '../builders/getDefaultState';
import { isActivityChemicalTreatment } from 'state/reducers/activity';

const Participants = () => {
  const {
    register,
    formState: { errors, disabled }
  } = useFormContext<FormSchema>();

  const subtype = useSelector((state) => state.ActivityPage?.formType);
  const requiresPacNumber = useSelector(isActivityChemicalTreatment);

  return (
    <ArrayField<FormSchema, 'participants'>
      name="participants"
      label={'Participants'}
      tooltip={tooltips.basic.participant}
      emptyValue={getDefaultFormState(subtype).participants[0]}
      rules={{ validate: (val) => minArrayLength(val, 1) }}
      renderRow={(index, remove) => (
        <>
          <TextInput
            disabled={disabled}
            error={errors?.participants?.[index]?.name}
            id={`participants.${index}.name`}
            label={'Name'}
            required
            width={requiresPacNumber ? Width.Half : Width.Full}
            {...register(`participants.${index}.name`, { required: true })}
          />
          {requiresPacNumber && (
            <NumberInput
              disabled={disabled}
              id={`participants.${index}.pac_number`}
              label="Pesticide Applicator Certificate Number"
              required
              tooltip={tooltips.basic.pac_number}
              width={Width.Half}
              {...register(`participants.${index}.pac_number`, {
                required: true,
                valueAsNumber: true,
                validate: (val) => minValue(val!, 1)
              })}
            />
          )}
          <DeleteControl onClick={() => remove(index)} />
        </>
      )}
    />
  );
};

export default Participants;
