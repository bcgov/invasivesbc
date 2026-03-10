import { useSelector } from 'utils/use_selector';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { useFormContext } from 'react-hook-form';
import { BiocontrolReleaseMonitoringSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useEffect, useMemo } from 'react';
import { MonitoringType, YesNoBool, YesNoUnknown } from 'UI/Features/Records/Activity/forms/enums';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { minValue, noFutureDate } from 'UI/Features/Records/Activity/forms/common/validators';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import BiocontrolCount from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/BiocontrolCount';
import useFilteredInvasivePlantCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredInvasivePlantCodes';
import useFilteredBiocontrolCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredBiocontrolCodes';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';

type PropTypes = {
  index: number;
  remove: (index: number) => void;
};
const BiocontrolReleaseMonitoringEntry = ({ index, remove }: PropTypes) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useFormContext<BiocontrolReleaseMonitoringSchema>();

  const validateMonitoringStartStopTimes = (_, formValues) => {
    const startTime = formValues.subtype_data?.entries?.[index]?.start_time;
    const stopTime = formValues.subtype_data?.entries?.[index]?.stop_time;
    if (!startTime || !stopTime || startTime <= stopTime) return true;
    return 'Start time must be before stop time.';
  };

  const SWEEP_COUNT_CODE = 'Cs';
  const codes = useSelector((state) => state.ActivityPage.formCodes);

  const selectedPlant = watch(`subtype_data.entries.${index}.invasive_plant`);
  const selectedAgent = watch(`subtype_data.entries.${index}.biocontrol_agent`);
  const biocontrolPresent = watch(`subtype_data.entries.${index}.biocontrol_present`);
  const monitoringType = watch(`subtype_data.entries.${index}.monitoring_type`);
  const monitoringMethod = watch(`subtype_data.entries.${index}.monitoring_method`);
  const { terrestrialPlantOptionsWithAgents } = useFilteredInvasivePlantCodes();
  const { agentOptionsForChosenPlant } = useFilteredBiocontrolCodes(selectedPlant);

  // Remove Sweep and Transplant Options as they are not needed for ReleaseMonitoring
  const monitoringMethodCodes = useMemo(
    () => codes?.BioAgentCollectionMethodCode.filter((c) => !['Sw', 'Tp'].includes(c.code as string)),
    [codes?.BioAgentCollectionMethodCode]
  );

  useEffect(() => {
    // Cleanup sign_of_biocontrol_presence when no biocontrol present.
    if (isDirty && !biocontrolPresent) {
      setValue(`subtype_data.entries.${index}.sign_of_biocontrol_presence`, []);
    }
  }, [biocontrolPresent]);

  useEffect(() => {
    // Clean up hidden monitoring fields when value changes
    if (!isDirty) return;
    if (monitoringType === 'Count') {
      setValue(`subtype_data.entries.${index}.count_duration_minutes`, undefined);
    } else if (monitoringType === 'Timed') {
      setValue(`subtype_data.entries.${index}.plant_count`, undefined);
    }
  }, [monitoringType]);

  useEffect(() => {
    // Delete number_of_sweeps if no longer needed
    if (isDirty && monitoringMethod !== SWEEP_COUNT_CODE) {
      setValue(`subtype_data.entries.${index}.number_of_sweeps`, undefined);
    }
  }, [monitoringMethod]);

  useEffect(() => {
    const currentSelectionNoLongerValid =
      selectedAgent && !agentOptionsForChosenPlant.some(({ code }) => code === selectedAgent);
    if (currentSelectionNoLongerValid && isDirty) {
      setValue(`subtype_data.entries.${index}.biocontrol_agent`, '');
    }
  }, [agentOptionsForChosenPlant]);

  return (
    <>
      <SingleSelect
        label={'Invasive Plant'}
        name={`subtype_data.entries.${index}.invasive_plant`}
        options={terrestrialPlantOptionsWithAgents}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.invasive_plant}
        width={Width.Half}
      />
      <SingleSelect
        label="Biological Agent"
        name={`subtype_data.entries.${index}.biocontrol_agent`}
        options={agentOptionsForChosenPlant}
        tooltip={tooltips.plant.biocontrol.agent}
        required
        rules={{ required: true }}
        width={Width.Half}
      />
      <SingleSelect
        label={'Biocontrol Present'}
        name={`subtype_data.entries.${index}.biocontrol_present`}
        options={YesNoBool}
        required
        rules={{ required: true }}
        width={Width.Half}
      />
      {biocontrolPresent ? (
        <MultiSelect
          label={'Sign of Biocontrol Presence'}
          name={`subtype_data.entries.${index}.sign_of_biocontrol_presence`}
          options={codes?.BiocontrolPresenceCode}
          required={biocontrolPresent}
          rules={{ required: biocontrolPresent }}
          tooltip={tooltips.plant.biocontrol.sign_of_presence}
          width={Width.Half}
        />
      ) : (
        <FormSpacer width={Width.Half} />
      )}
      <SingleSelect
        label={'Monitoring Type'}
        name={`subtype_data.entries.${index}.monitoring_type`}
        options={MonitoringType}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.monitoring.type}
        width={Width.Half}
      />
      {/* Monitoring Type Follow Up Fields */}
      {monitoringType === 'Timed' && (
        <NumberInput
          error={errors?.subtype_data?.[index]?.count_duration_minutes}
          label={'Count duration (Minutes)'}
          required
          tooltip={tooltips.plant.biocontrol.monitoring.count}
          width={Width.Half}
          {...register(`subtype_data.entries.${index}.count_duration_minutes`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => minValue(val!, 1)
          })}
        />
      )}
      {monitoringType === 'Count' && (
        <NumberInput
          error={errors?.subtype_data?.[index]?.plant_count}
          label={'Plant Count'}
          required
          width={Width.Half}
          {...register(`subtype_data.entries.${index}.plant_count`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => minValue(val!, 1)
          })}
        />
      )}
      {/* Leave empty slot if none selected to avoid whole section changing slot position */}
      {!monitoringType && <FormSpacer width={Width.Half} />}
      <SingleSelect
        label={'Monitoring Method'}
        name={`subtype_data.entries.${index}.monitoring_method`}
        options={monitoringMethodCodes}
        required
        rules={{ required: true }}
        width={Width.Half}
      />
      {monitoringMethod === SWEEP_COUNT_CODE ? (
        <NumberInput
          error={errors?.subtype_data?.entries?.[index]?.number_of_sweeps}
          label={'Number of Sweeps'}
          required
          width={Width.Half}
          {...register(`subtype_data.entries.${index}.number_of_sweeps`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => minValue(val!, 1)
          })}
        />
      ) : (
        <FormSpacer width={Width.Half} />
      )}

      <DateInput
        error={errors?.subtype_data?.entries?.[index]?.start_time}
        includeTime
        label={'Monitoring Start Time'}
        required
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.start_time`, {
          deps: [`subtype_data.entries.${index}.stop_time`],
          required: true,
          validate: {
            noFutureData: (val) => noFutureDate(val!),
            startBeforeStop: validateMonitoringStartStopTimes
          }
        })}
      />
      <DateInput
        error={errors?.subtype_data?.entries?.[index]?.stop_time}
        label={'Monitoring Stop Time'}
        includeTime
        required
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.stop_time`, {
          deps: [`subtype_data.entries.${index}.start_time`],
          required: true,
          validate: {
            noFutureData: (val) => noFutureDate(val!),
            startBeforeStop: validateMonitoringStartStopTimes
          }
        })}
      />
      {biocontrolPresent && (
        <>
          <MultiSelect
            label={'Location Agents Found'}
            name={`subtype_data.entries.${index}.location_agent_found`}
            options={codes?.AgentLocationFoundCode}
            rules={{ required: true }}
            tooltip={tooltips.plant.biocontrol.monitoring.location_found}
            width={Width.Half}
          />
          <SingleSelect
            label={'Suitable for Collection'}
            name={`subtype_data.entries.${index}.suitable_for_collection`}
            options={YesNoUnknown}
            rules={{ required: true }}
            tooltip={tooltips.plant.biocontrol.monitoring.suitable_for_collection}
            width={Width.Half}
          />
          <BiocontrolCount extended index={index} />
          <BiocontrolCount estimate extended index={index} />
        </>
      )}
      <DeleteControl onClick={() => remove(index)} />
    </>
  );
};

export default BiocontrolReleaseMonitoringEntry;
