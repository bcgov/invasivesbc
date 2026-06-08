import { get, useFormContext, useWatch } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import { minArrayLength, greaterThan } from 'UI/Features/Records/Activity/forms/common/validators';
import { ActivitySubtypes } from 'sharedAPI';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

const TargetPlantPhenology = () => {
  const {
    register,
    control,
    setValue,
    getValues,
    clearErrors,
    setError,
    formState: { disabled, errors }
  } = useFormContext<BiocontrolReleaseSchema>();
  const { basePath, getPath } = useFieldPath<BiocontrolReleaseSchema>('subtype_data.target_plant_phenology');
  const plantPhenologyExists = useWatch({ control, name: basePath });
  const isPhenologyDetails = !!plantPhenologyExists;

  const handleChange = async () => {
    const data = getValues(basePath);
    if (!data) return;
    const { target_plant_heights, ...percentages } = data;
    const sum = Object.values(percentages).reduce((acc, curr) => (acc as number) + (Number(curr) || 0), 0);
    if (sum !== 100) {
      setError(getPath('root'), { message: `Sum must be 100 (current: ${sum})` });
    } else {
      clearErrors(getPath('root'));
    }
  };

  const handleCheckboxChange = () => {
    if (isPhenologyDetails) {
      // If closing, clear the values
      setValue(basePath, undefined, { shouldDirty: true });
      clearErrors(getPath('root'));
    } else {
      // Set the values to default state
      const defaultState = (getDefaultFormState(ActivitySubtypes.Biocontrol_Release) as BiocontrolReleaseSchema)
        .subtype_data.target_plant_phenology;
      setValue(basePath, defaultState, { shouldDirty: true });
    }
  };

  return (
    <Fieldset label={'Target Plant Phenology'}>
      <CheckboxUI
        label={'Phenology Details Recorded'}
        state={isPhenologyDetails}
        disabled={disabled}
        onChange={handleCheckboxChange}
      />
      {isPhenologyDetails && (
        <>
          <ArrayField<BiocontrolReleaseSchema, any>
            name={getPath('target_plant_heights')}
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
                error={get(errors, getPath(`target_plant_heights.${index}.height_cm`))}
                {...register(getPath(`target_plant_heights.${index}.height_cm`), {
                  required: true,
                  onChange: handleChange,
                  valueAsNumber: true,
                  validate: (val) => greaterThan(val, 0)
                })}
              />
            )}
          />
          <NumberInput
            label="Winter Dormant (%)"
            required
            width={Width.Half}
            error={get(errors, getPath('winter_dormant'))}
            {...register(getPath('winter_dormant'), {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Seedlings (%)"
            required
            width={Width.Half}
            error={get(errors, getPath('seedlings'))}
            {...register(getPath('seedlings'), {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Rosettes (%)"
            required
            width={Width.Half}
            error={get(errors, getPath('rosettes'))}
            {...register(getPath('rosettes'), {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Bolts (%)"
            required
            width={Width.Half}
            error={get(errors, getPath('bolts'))}
            {...register(getPath('bolts'), {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Flowering (%)"
            required
            width={Width.Half}
            error={get(errors, getPath('flowering'))}
            {...register(getPath('flowering'), {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Seeds Forming (%)"
            required
            width={Width.Half}
            error={get(errors, getPath('seeds_forming'))}
            {...register(getPath('seeds_forming'), {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          <NumberInput
            label="Senescent (%)"
            required
            width={Width.Half}
            error={get(errors, getPath('senescent'))}
            {...register(getPath('senescent'), {
              required: true,
              onChange: handleChange,
              valueAsNumber: true
            })}
          />
          {errors?.subtype_data?.target_plant_phenology?.root && (
            <ErrorMessage error={get(errors, getPath('root'))} label="Phenology Total" />
          )}
        </>
      )}
    </Fieldset>
  );
};

export default TargetPlantPhenology;
