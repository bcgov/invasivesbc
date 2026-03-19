import { FieldError, useFormContext, useWatch } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { BiocontrolReleaseSchema, EntryBasePath } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import { useEffect, useState } from 'react';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import { minArrayLength, minValue } from 'UI/Features/Records/Activity/forms/common/validators';
import { ActivitySubtypes } from 'sharedAPI';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';

const TargetPlantPhenology = () => {
  const {
    register,
    control,
    setValue,
    getValues,
    clearErrors,
    setError,
    formState: { disabled, isDirty, errors }
  } = useFormContext<BiocontrolReleaseSchema>();
  const plantPhenologyExists = useWatch({ control, name: 'subtype_data.target_plant_phenology' });
  const [isPhenologyDetails, setIsPhenologyDetails] = useState<boolean>(!!plantPhenologyExists);

  const handleChange = async () => {
    const data = getValues('subtype_data.target_plant_phenology');
    if (!data) return;
    const { target_plant_heights, ...percentages } = data;
    const sum = Object.values(percentages).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    if (sum !== 100) {
      setError('subtype_data.target_plant_phenology.root' as EntryBasePath, {
        message: `Sum must be 100 (current: ${sum})`
      });
    } else {
      clearErrors('subtype_data.target_plant_phenology.root' as EntryBasePath);
    }
  };

  useEffect(() => {
    // Delete Phenology if box unchecked
    if (!isPhenologyDetails && isDirty) {
      setValue('subtype_data.target_plant_phenology', undefined);
    }
  }, [isPhenologyDetails]);

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
          <ArrayField<BiocontrolReleaseSchema, any>
            name="subtype_data.target_plant_phenology.target_plant_heights"
            label={'Target Plant Heights'}
            width={Width.Full}
            rules={{ validate: (arr) => minArrayLength(arr, 1) }}
            emptyValue={
              (getDefaultFormState(ActivitySubtypes.Biocontrol_Release) as BiocontrolReleaseSchema).subtype_data
                .target_plant_phenology?.target_plant_heights[0]
            }
            renderRow={(index) => (
              <NumberInput
                label="Height"
                required
                error={errors?.subtype_data?.target_plant_phenology?.target_plant_heights?.[index]?.height_cm}
                {...register(`subtype_data.target_plant_phenology.target_plant_heights.${index}.height_cm`, {
                  required: true,
                  onChange: handleChange,
                  valueAsNumber: true,
                  validate: (val) => minValue(val!, 1)
                })}
              />
            )}
          />
          <NumberInput
            label="Winter Dormant (%)"
            required
            width={Width.Half}
            error={errors?.subtype_data?.target_plant_phenology?.winter_dormant}
            {...register('subtype_data.target_plant_phenology.winter_dormant', {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Seedlings (%)"
            required
            width={Width.Half}
            error={errors?.subtype_data?.target_plant_phenology?.seedlings}
            {...register('subtype_data.target_plant_phenology.seedlings', {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Rosettes (%)"
            required
            width={Width.Half}
            error={errors?.subtype_data?.target_plant_phenology?.rosettes}
            {...register('subtype_data.target_plant_phenology.rosettes', {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Bolts (%)"
            required
            width={Width.Half}
            error={errors?.subtype_data?.target_plant_phenology?.bolts}
            {...register('subtype_data.target_plant_phenology.bolts', {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Flowering (%)"
            required
            width={Width.Half}
            error={errors?.subtype_data?.target_plant_phenology?.flowering}
            {...register('subtype_data.target_plant_phenology.flowering', {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Seeds Forming (%)"
            required
            width={Width.Half}
            error={errors?.subtype_data?.target_plant_phenology?.seeds_forming}
            {...register('subtype_data.target_plant_phenology.seeds_forming', {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Senescent (%)"
            required
            width={Width.Half}
            error={errors?.subtype_data?.target_plant_phenology?.senescent}
            {...register('subtype_data.target_plant_phenology.senescent', {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          {errors?.subtype_data?.target_plant_phenology?.root && (
            <ErrorMessage
              error={errors.subtype_data.target_plant_phenology.root as FieldError}
              label="Phenology Total"
            />
          )}
        </>
      )}
    </Fieldset>
  );
};

export default TargetPlantPhenology;
