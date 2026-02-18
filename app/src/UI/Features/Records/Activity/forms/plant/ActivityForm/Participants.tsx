import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ActivitySubtypes } from 'sharedAPI';
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

const Participants = () => {
  const {
    register,
    formState: { errors, disabled }
  } = useFormContext<FormSchema>();

  const subtype = useSelector((state) => state.ActivityPage?.formType);
  const isChemicalTreatment: boolean = useMemo(
    () =>
      [ActivitySubtypes.Treatment_Chemical_Plant_Aquatic, ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial].some(
        (st) => st === subtype
      ),
    [subtype]
  );

  return (
    <ArrayField<FormSchema, 'participants'>
      name="participants"
      label={'Participants'}
      tooltip={tooltips.basic.participant}
      emptyValue={getDefaultFormState(subtype).participants}
      rules={{ validate: (val) => minArrayLength(val, 1) }}
      renderRow={(index, remove) => (
        <>
          <TextInput
            disabled={disabled}
            error={errors?.participants?.[index]?.name}
            id={`participants.${index}.name`}
            label={'Name'}
            required
            width={isChemicalTreatment ? Width.Half : Width.Full}
            {...register(`participants.${index}.name`, { required: true })}
          />
          {isChemicalTreatment && (
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
          <DeleteControl disabled={disabled} onClick={() => remove(index)} />
        </>
      )}
    />
  );
};

export default Participants;
