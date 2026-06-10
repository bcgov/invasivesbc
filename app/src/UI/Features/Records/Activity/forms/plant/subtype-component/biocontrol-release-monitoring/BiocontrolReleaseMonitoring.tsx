import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import MicrositeConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/MicrositeConditions';
import TargetPlantPhenology from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/TargetPlantPhenology';
import BiocontrolWeatherConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/WeatherConditions';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { get, useFormContext, useWatch } from 'react-hook-form';
import { BiocontrolReleaseMonitoringSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { distinctEntries, lessThanEqual, greaterThanEqual } from 'UI/Features/Records/Activity/forms/common/validators';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { ActivitySubtypes } from 'sharedAPI';
import BiocontrolReleaseMonitoringEntry from './BiocontrolReleaseMonitoringEntry';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

const BiocontrolReleaseMonitoring = () => {
  const {
    register,
    setValue,
    control,
    formState: { errors }
  } = useFormContext<BiocontrolReleaseMonitoringSchema>();

  const { getPath, basePath } = useFieldPath<BiocontrolReleaseMonitoringSchema>('subtype_data.spread_results');
  const spreadResultsExists = useWatch({ control, name: basePath });
  const isSpreadResultsPresent = !!spreadResultsExists;

  const handleCheckboxChange = () => {
    if (isSpreadResultsPresent) {
      // If closing, clear the values
      setValue(basePath, undefined, { shouldDirty: true });
    } else {
      // Set the values to default state
      const defaultState = (
        getDefaultFormState(
          ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial
        ) as BiocontrolReleaseMonitoringSchema
      ).subtype_data.spread_results;
      setValue(basePath, defaultState, { shouldDirty: true });
    }
  };

  return (
    <>
      <BiocontrolWeatherConditions />
      <MicrositeConditions />
      <ArrayField<BiocontrolReleaseMonitoringSchema, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label={'Biological Monitoring Information'}
        rules={{
          required: true,
          validate: (arr) =>
            distinctEntries(
              arr,
              ['biocontrol_agent', 'invasive_plant'],
              'Entries must contain unique Agents and Plants'
            )
        }}
        renderRow={(index) => <BiocontrolReleaseMonitoringEntry index={index} />}
        emptyValue={
          (
            getDefaultFormState(
              ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial
            ) as BiocontrolReleaseMonitoringSchema
          ).subtype_data.entries[0]
        }
      />

      <TargetPlantPhenology />
      <Fieldset label={'Spread Results'} tooltip={tooltips.plant.spread_results.recorded}>
        <CheckboxUI label={'Spread Details Recorded'} state={isSpreadResultsPresent} onChange={handleCheckboxChange} />
        {isSpreadResultsPresent && (
          <>
            <NumberInput
              label={'Agent Density %'}
              width={Width.Half}
              tooltip={tooltips.plant.spread_results.agent_density}
              error={get(errors, getPath('agent_density'))}
              {...register(getPath('agent_density'), {
                valueAsNumber: true,
                shouldUnregister: true,
                validate: (val) => lessThanEqual(val, 100)
              })}
            />
            <NumberInput
              label={'Plant Attack %'}
              width={Width.Half}
              tooltip={tooltips.plant.spread_results.plant_attack}
              error={get(errors, getPath('plant_attack'))}
              {...register(getPath('plant_attack'), {
                valueAsNumber: true,
                shouldUnregister: true,
                validate: (val) => lessThanEqual(val, 100)
              })}
            />
            <NumberInput
              label={'Max Spread Distance (m)'}
              required={isSpreadResultsPresent}
              width={Width.Half}
              tooltip={tooltips.plant.spread_results.max_spread_m}
              error={get(errors, getPath('max_spread_distance_m'))}
              {...register(getPath('max_spread_distance_m'), {
                required: isSpreadResultsPresent,
                valueAsNumber: true,
                shouldUnregister: true,
                validate: { minDistance: (val) => greaterThanEqual(val, 0) }
              })}
            />
            <NumberInput
              label={'Max Spread Aspect (degrees)'}
              required={isSpreadResultsPresent}
              width={Width.Half}
              tooltip={tooltips.plant.spread_results.max_spread_deg}
              error={get(errors, getPath('max_spread_aspect_deg'))}
              {...register(getPath('max_spread_aspect_deg'), {
                valueAsNumber: true,
                shouldUnregister: true,
                required: isSpreadResultsPresent,
                validate: {
                  minDegrees: (val) => greaterThanEqual(val, 0),
                  maxDegrees: (val) => lessThanEqual(val, 360)
                }
              })}
            />
          </>
        )}
      </Fieldset>
    </>
  );
};

export default BiocontrolReleaseMonitoring;
