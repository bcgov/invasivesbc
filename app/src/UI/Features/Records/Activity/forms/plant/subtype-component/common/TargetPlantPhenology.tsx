import { FieldError, useFormContext, useWatch } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import Spacer from 'UI/Reusable/Spacer/Spacer';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';
import { minArrayLength, minValue } from 'UI/Features/Records/Activity/forms/common/validators';
import { ActivitySubtypes } from 'sharedAPI';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import debounce from 'lodash.debounce';

const TargetPlantPhenology = () => {
  const TRIGGER_DELAY = 500; //ms
  const {
    register,
    control,
    setValue,
    clearErrors,
    setError,
    formState: { disabled, isDirty, errors }
  } = useFormContext<BiocontrolReleaseSchema>();
  const plantPhenologyExists = useWatch({ control, name: 'subtype_data.target_plant_phenology' });
  const [isPhenologyDetails, setIsPhenologyDetails] = useState<boolean>(!!plantPhenologyExists);

  const phenologyValues = useWatch({
    control,
    name: [
      'subtype_data.target_plant_phenology.winter_dormant',
      'subtype_data.target_plant_phenology.seedlings',
      'subtype_data.target_plant_phenology.rosettes',
      'subtype_data.target_plant_phenology.bolts',
      'subtype_data.target_plant_phenology.flowering',
      'subtype_data.target_plant_phenology.seeds_forming',
      'subtype_data.target_plant_phenology.senescent'
    ]
  });

  const debouncedValidate = useMemo(
    () =>
      debounce((values: any[]) => {
        const sum = values.reduce((acc: number, curr) => acc + (Number(curr) || 0), 0);
        if (sum !== 100) {
          setError('subtype_data.target_plant_phenology.root' as any, {
            type: 'manual',
            message: `Sum must be 100 (current: ${sum})`
          });
        } else {
          clearErrors('subtype_data.target_plant_phenology.root' as any);
        }
      }, TRIGGER_DELAY),
    [setError, clearErrors]
  );

  useEffect(() => {
    if (phenologyValues) {
      debouncedValidate(phenologyValues);
    }
    return () => debouncedValidate.cancel();
  }, [phenologyValues, debouncedValidate]);

  useEffect(() => {
    // Delete Phenology if box unchecked
    if (!isPhenologyDetails && isDirty) {
      setValue('subtype_data.target_plant_phenology', undefined);
    }
  }, [isPhenologyDetails]);

  useEffect(() => {});
  return (
    <Fieldset label={'Target Plant Phenology'}>
      <CheckboxUI
        label={'Phenology Details Recorded'}
        state={isPhenologyDetails}
        disabled={disabled}
        onChange={() => setIsPhenologyDetails((prev) => !prev)}
      />
      {isPhenologyDetails && (
        <>
          <NumberInput
            label="Winter Dormant (%)"
            required
            width={Width.Half}
            {...register('subtype_data.target_plant_phenology.winter_dormant', { required: true, valueAsNumber: true })}
          />
          <NumberInput
            label="Seedlings (%)"
            required
            width={Width.Half}
            {...register('subtype_data.target_plant_phenology.seedlings', { required: true, valueAsNumber: true })}
          />
          <NumberInput
            label="Rosettes (%)"
            required
            width={Width.Half}
            {...register('subtype_data.target_plant_phenology.rosettes', { required: true, valueAsNumber: true })}
          />
          <NumberInput
            label="Bolts (%)"
            required
            width={Width.Half}
            {...register('subtype_data.target_plant_phenology.bolts', { required: true, valueAsNumber: true })}
          />
          <NumberInput
            label="Flowering (%)"
            required
            width={Width.Half}
            {...register('subtype_data.target_plant_phenology.flowering', { required: true, valueAsNumber: true })}
          />
          <NumberInput
            label="Seeds Forming (%)"
            required
            width={Width.Half}
            {...register('subtype_data.target_plant_phenology.seeds_forming', { required: true, valueAsNumber: true })}
          />
          <NumberInput
            label="Senescent (%)"
            required
            width={Width.Half}
            {...register('subtype_data.target_plant_phenology.senescent', { required: true, valueAsNumber: true })}
          />
          <Spacer x={187} y={20} />
          <ArrayField<BiocontrolReleaseSchema, any>
            name="subtype_data.target_plant_phenology.target_plant_heights"
            label={'Target Plant Heights'}
            width={Width.Half}
            rules={{ validate: (arr) => minArrayLength(arr, 1) }}
            emptyValue={
              (getDefaultFormState(ActivitySubtypes.Biocontrol_Release) as BiocontrolReleaseSchema).subtype_data
                .target_plant_phenology?.target_plant_heights[0]
            }
            renderRow={(index, remove) => (
              <Fragment key={index}>
                <NumberInput
                  label="Height"
                  required
                  error={errors?.subtype_data?.target_plant_phenology?.target_plant_heights?.[index]?.height}
                  {...register(`subtype_data.target_plant_phenology.target_plant_heights.${index}.height`, {
                    required: true,
                    valueAsNumber: true,
                    validate: (val) => minValue(val!, 1)
                  })}
                />
                <DeleteControl onClick={() => remove(index)} />
              </Fragment>
            )}
          />
          {errors?.subtype_data?.target_plant_phenology && (
            <ErrorMessage
              error={errors.subtype_data.target_plant_phenology.root as FieldError}
              label="Phenology Total"
            />
          )}
          <Spacer x={200} y={20} />
        </>
      )}
    </Fieldset>
  );
};
export default TargetPlantPhenology;
