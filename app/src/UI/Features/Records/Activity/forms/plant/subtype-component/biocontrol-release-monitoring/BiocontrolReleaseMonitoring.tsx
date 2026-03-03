import { useEffect, useState } from 'react';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import MicrositeConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/MicrositeConditions';
import TargetPlantPhenology from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/TargetPlantPhenology';
import BiocontrolWeatherConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/WeatherConditions';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { useFormContext } from 'react-hook-form';
import { BiocontrolReleaseMonitoringSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { maxValue, minValue } from 'UI/Features/Records/Activity/forms/common/validators';
import tooltips from '../../content/tooltips';
import ArrayField from '../../../common/ArrayField/ArrayField';
import getDefaultFormState from '../../builders/getDefaultState';
import { ActivitySubtypes } from 'sharedAPI';
import BiocontrolReleaseMonitoringEntry from './BiocontrolReleaseMonitoringEntry';

const BiocontrolReleaseMonitoring = () => {
  const {
    register,
    getValues,
    setValue,
    formState: { errors, isDirty }
  } = useFormContext<BiocontrolReleaseMonitoringSchema>();
  const [isSpreadResultsPresent, setIsSpreadResultsPresent] = useState<boolean>(false);

  useEffect(() => {
    const isResults = !!getValues().subtype_data.max_spread_aspect_deg != undefined;
    setIsSpreadResultsPresent(isResults);
  }, []);

  useEffect(() => {
    // Clear Spread results section if unchecked.
    if (!isSpreadResultsPresent && isDirty) {
      setValue('subtype_data.agent_density', undefined);
      setValue('subtype_data.plant_attack', undefined);
      setValue('subtype_data.max_spread_aspect_deg', undefined);
      setValue('subtype_data.max_spread_distance_m', undefined);
    }
  }, [isSpreadResultsPresent]);
  return (
    <>
      <BiocontrolWeatherConditions />
      <MicrositeConditions />
      <ArrayField<BiocontrolReleaseMonitoringSchema, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label={'Biological Monitoring Information'}
        renderRow={(index, remove) => <BiocontrolReleaseMonitoringEntry index={index} remove={remove} />}
        emptyValue={
          getDefaultFormState(ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial).subtype_data.entries[0]
        }
      />

      <TargetPlantPhenology />
      <Fieldset label={'Spread Results'} tooltip={tooltips.plant.spread_results.recorded}>
        <CheckboxUI
          label={'Spread Details Recorded'}
          state={isSpreadResultsPresent}
          onChange={() => setIsSpreadResultsPresent((prev) => !prev)}
        />
        {isSpreadResultsPresent && (
          <>
            <NumberInput
              label={'Agent Density %'}
              width={Width.Half}
              tooltip={tooltips.plant.spread_results.max_spread_deg}
              error={errors?.subtype_data?.agent_density}
              {...register('subtype_data.agent_density', {
                valueAsNumber: true,
                validate: (val) => maxValue(val!, 100)
              })}
            />
            <NumberInput
              label={'Plant Attack %'}
              width={Width.Half}
              tooltip={tooltips.plant.spread_results.plant_attack}
              error={errors?.subtype_data?.plant_attack}
              {...register('subtype_data.plant_attack', {
                valueAsNumber: true,
                validate: (val) => maxValue(val!, 100)
              })}
            />
            <NumberInput
              label={'Max Spread Distance (m)'}
              required={isSpreadResultsPresent}
              width={Width.Half}
              tooltip={tooltips.plant.spread_results.max_spread_m}
              error={errors?.subtype_data?.max_spread_distance_m}
              {...register('subtype_data.max_spread_distance_m', {
                required: isSpreadResultsPresent,
                valueAsNumber: true,
                validate: { minDistance: (val) => minValue(val!, 0) }
              })}
            />
            <NumberInput
              label={'Max Spread Aspect (degrees)'}
              required={isSpreadResultsPresent}
              width={Width.Half}
              tooltip={tooltips.plant.spread_results.max_spread_deg}
              error={errors?.subtype_data?.max_spread_aspect_deg}
              {...register('subtype_data.max_spread_aspect_deg', {
                valueAsNumber: true,
                required: isSpreadResultsPresent,
                validate: {
                  minDegrees: (val) => minValue(val!, 0),
                  maxDegrees: (val) => maxValue(val!, 360)
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
