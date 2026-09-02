import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { get, useFormContext } from 'react-hook-form';
import { BiocontrolDispersalMonitoringSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useEffect, useMemo } from 'react';
import { MonitoringType, YesNoBool, YesNoUnknown } from 'UI/Features/Records/Activity/forms/enums';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { greaterThanEqual, noFutureDate } from 'UI/Features/Records/Activity/forms/common/validators';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import BiocontrolCount from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/BiocontrolCount';
import useFilteredInvasivePlantCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredInvasivePlantCodes';
import useFilteredBiocontrolCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredBiocontrolCodes';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

type PropTypes = {
  index: number;
};
const BiocontrolDispersalMonitoringEntry = ({ index }: PropTypes) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useFormContext<BiocontrolDispersalMonitoringSchema>();
  const { getPath } = useFieldPath<BiocontrolDispersalMonitoringSchema>(`subtype_data.entries.${index}`);

  const validateMonitoringStartStopTimes = (_, formValues) => {
    const startTime = formValues.subtype_data?.entries?.[index]?.start_time;
    const stopTime = formValues.subtype_data?.entries?.[index]?.stop_time;
    if (!startTime || !stopTime || startTime <= stopTime) return true;
    return 'Start time must be before stop time.';
  };

  const SWEEP_COUNT_CODE = 'Cs';
  const codes = useSelector((state) => state.ActivityPage.formCodes);

  const selectedPlant = watch(getPath('invasive_plant'));
  const selectedAgent = watch(getPath('biocontrol_agent'));
  const biocontrolPresent = watch(getPath('biocontrol_present'));
  const monitoringType = watch(getPath('monitoring_type'));
  const monitoringMethod = watch(getPath('monitoring_method'));
  const { terrestrialPlantOptionsWithAgents } = useFilteredInvasivePlantCodes();
  const { agentOptionsForChosenPlant } = useFilteredBiocontrolCodes(selectedPlant);

  // Remove Sweep and Transplant Options as they are not needed for Monitoring
  const monitoringMethodCodes = useMemo(
    () => codes?.BioAgentMonitoringMethodCode.filter((c) => !['Sw', 'Tp'].includes(c.code as string)),
    [codes?.BioAgentMonitoringMethodCode]
  );

  useEffect(() => {
    // Cleanup Irrelevant fields when biocontrol present set to false.
    if (isDirty && biocontrolPresent == false) {
      setValue(getPath('sign_of_biocontrol_presence'), []);
      setValue(getPath('estimated_biological_agents'), []);
      setValue(getPath('actual_biological_agents'), []);
    }
  }, [biocontrolPresent]);

  useEffect(() => {
    const currentSelectionNoLongerValid =
      selectedAgent && !agentOptionsForChosenPlant.some(({ code }) => code === selectedAgent);
    if (currentSelectionNoLongerValid && isDirty) {
      setValue(getPath('biocontrol_agent'), '');
    }
  }, [agentOptionsForChosenPlant]);

  useEffect(() => {
    // Delete number_of_sweeps if no longer needed
    if (isDirty && monitoringMethod !== SWEEP_COUNT_CODE) {
      setValue(getPath('number_of_sweeps'), undefined);
    }
  }, [monitoringMethod]);
  return (
    <>
      <SingleSelect
        label={'Invasive Plant'}
        name={getPath('invasive_plant')}
        options={terrestrialPlantOptionsWithAgents}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.invasive_plant}
        width={Width.Half}
      />
      <SingleSelect
        label="Biological Agent"
        name={getPath('biocontrol_agent')}
        options={agentOptionsForChosenPlant}
        tooltip={tooltips.plant.biocontrol.agent}
        required
        rules={{ required: true }}
        width={Width.Half}
      />
      <SingleSelect
        label={'Biocontrol Present'}
        name={getPath('biocontrol_present')}
        options={YesNoBool}
        required
        rules={{ validate: (val) => val != undefined }}
        width={Width.Half}
      />
      {biocontrolPresent ? (
        <MultiSelect
          label={'Sign of Biocontrol Presence'}
          name={getPath('sign_of_biocontrol_presence')}
          options={codes?.BiocontrolPresenceCode}
          tooltip={tooltips.plant.biocontrol.sign_of_presence}
          width={Width.Half}
        />
      ) : (
        <FormSpacer width={Width.Half} />
      )}
      <SingleSelect
        label={'Monitoring Type'}
        name={getPath('monitoring_type')}
        options={MonitoringType}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.monitoring.type}
        width={Width.Half}
      />
      {/* Monitoring Type Follow Up Fields */}
      {monitoringType === 'Timed' && (
        <NumberInput
          error={get(errors, getPath('count_duration_minutes'))}
          label={'Count duration (Minutes)'}
          tooltip={tooltips.plant.biocontrol.monitoring.count}
          width={Width.Half}
          {...register(getPath('count_duration_minutes'), {
            valueAsNumber: true,
            shouldUnregister: true,
            validate: (val) => greaterThanEqual(val, 1)
          })}
        />
      )}
      {monitoringType === 'Count' && (
        <NumberInput
          error={get(errors, getPath('plant_count'))}
          label={'Plant Count'}
          width={Width.Half}
          {...register(getPath('plant_count'), {
            shouldUnregister: true,
            validate: (val) => greaterThanEqual(val, 1)
          })}
        />
      )}
      {/* Leave empty slot if none selected to avoid whole section changing slot position */}
      {!monitoringType && <FormSpacer width={Width.Half} />}
      <SingleSelect
        label={'Monitoring Method'}
        name={getPath('monitoring_method')}
        options={monitoringMethodCodes}
        required
        rules={{ required: true }}
        width={Width.Half}
      />
      {monitoringMethod === SWEEP_COUNT_CODE ? (
        <NumberInput
          error={get(errors, getPath('number_of_sweeps'))}
          label={'Number of Sweeps'}
          required
          width={Width.Half}
          {...register(getPath('number_of_sweeps'), {
            required: true,
            valueAsNumber: true,
            shouldUnregister: true,
            validate: (val) => greaterThanEqual(val, 1)
          })}
        />
      ) : (
        <FormSpacer width={Width.Half} />
      )}
      <SingleSelect
        label={'Linear Segment'}
        options={YesNoUnknown}
        tooltip={tooltips.plant.biocontrol.linear_segment}
        width={Width.Half}
        name={getPath('linear_segment')}
      />
      <FormSpacer width={Width.Half} />
      <DateInput
        error={get(errors, getPath('start_time'))}
        includeTime
        label={'Monitoring Start Time'}
        required
        width={Width.Half}
        {...register(getPath('start_time'), {
          deps: [getPath('stop_time')],
          required: true,
          validate: {
            noFutureData: (val) => noFutureDate(val),
            startBeforeStop: validateMonitoringStartStopTimes
          }
        })}
      />
      <DateInput
        error={get(errors, getPath('stop_time'))}
        label={'Monitoring Stop Time'}
        includeTime
        required
        width={Width.Half}
        {...register(getPath('stop_time'), {
          deps: [getPath('start_time')],
          required: true,
          validate: {
            noFutureData: (val) => noFutureDate(val),
            startBeforeStop: validateMonitoringStartStopTimes
          }
        })}
      />
      {biocontrolPresent && (
        <>
          <MultiSelect
            label={'Location Agents Found'}
            name={getPath('location_agent_found')}
            options={codes?.AgentLocationFoundTerrainCode}
            tooltip={tooltips.plant.biocontrol.monitoring.location_found}
            width={Width.Half}
          />
          <SingleSelect
            label={'Suitable for Collection'}
            name={getPath('suitable_for_collection')}
            rules={{ required: true }}
            required
            options={YesNoUnknown}
            tooltip={tooltips.plant.biocontrol.monitoring.suitable_for_collection}
            width={Width.Half}
          />
          <BiocontrolCount extended index={index} />
          <BiocontrolCount estimate extended index={index} />
        </>
      )}
    </>
  );
};

export default BiocontrolDispersalMonitoringEntry;
