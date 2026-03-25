import { get, useFormContext } from 'react-hook-form';
import { BiocontrolCollectionSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { MonitoringType } from 'UI/Features/Records/Activity/forms/enums';
import { greaterThanEqual, noFutureDate } from 'UI/Features/Records/Activity/forms/common/validators';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';
import BiocontrolCount from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/BiocontrolCount';
import useFilteredInvasivePlantCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredInvasivePlantCodes';
import useFilteredBiocontrolCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredBiocontrolCodes';
import { useEffect } from 'react';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';

type PropTypes = {
  index: number;
};
const BiocontrolCollectionEntry = ({ index }: PropTypes) => {
  const validateMonitoringStartStopTimes = (_, formValues) => {
    const startTime = formValues.subtype_data?.entries?.[index]?.start_time;
    const stopTime = formValues.subtype_data?.entries?.[index]?.stop_time;
    if (!startTime || !stopTime || startTime <= stopTime) return true;
    return 'Start time must be before stop time.';
  };
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useFormContext<BiocontrolCollectionSchema>();
  const SWEEP_COUNT_CODE = 'Cs';
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const selectedPlant = watch(`subtype_data.entries.${index}.invasive_plant`);
  const selectedAgent = watch(`subtype_data.entries.${index}.biological_agent`);
  const collectionType = watch(`subtype_data.entries.${index}.collection_type`);
  const collectionMethod = watch(`subtype_data.entries.${index}.collection_method`);
  const { terrestrialPlantOptionsWithAgents } = useFilteredInvasivePlantCodes();
  const { agentOptionsForChosenPlant } = useFilteredBiocontrolCodes(selectedPlant);

  useEffect(() => {
    const currentSelectionNoLongerValid =
      selectedAgent && !agentOptionsForChosenPlant.some(({ code }) => code === selectedAgent);
    if (currentSelectionNoLongerValid && isDirty) {
      setValue(`subtype_data.entries.${index}.biological_agent`, '');
    }
  }, [agentOptionsForChosenPlant]);

  return (
    <>
      <SingleSelect
        label={'Invasive Plant'}
        options={terrestrialPlantOptionsWithAgents}
        tooltip={tooltips.plant.invasive_plant}
        rules={{ required: true }}
        width={Width.Half}
        name={`subtype_data.entries.${index}.invasive_plant`}
        required
      />
      <SingleSelect
        label={'Biological Control Agent'}
        required
        tooltip={tooltips.plant.biocontrol.agent}
        options={agentOptionsForChosenPlant}
        noOptionsMessage="Select an Invasive Plant to see options"
        rules={{ required: true }}
        width={Width.Half}
        name={`subtype_data.entries.${index}.biological_agent`}
      />
      <NumberInput
        label={'Historical IAPP Site ID'}
        width={Width.Half}
        tooltip={tooltips.basic.historical_iapp}
        error={get(errors, `errors.subtype_data.entries.${index}.historical_iapp_site`)}
        {...register(`subtype_data.entries.${index}.historical_iapp_site`, { valueAsNumber: true })}
      />
      <FormSpacer width={Width.Half} />
      <SingleSelect
        label={'Collection Type'}
        name={`subtype_data.entries.${index}.collection_type`}
        options={MonitoringType}
        required
        tooltip={tooltips.plant.biocontrol.monitoring.type}
        width={Width.Half}
      />
      {/* Collection Type Follow Up Fields */}
      {collectionType === 'Timed' && (
        <NumberInput
          error={get(errors, `subtype_data.entries.${index}.time_collection_duration_minutes`)}
          label={'Count duration (Minutes)'}
          required
          tooltip={tooltips.plant.biocontrol.monitoring.count}
          width={Width.Half}
          {...register(`subtype_data.entries.${index}.time_collection_duration_minutes`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => greaterThanEqual(val, 1)
          })}
        />
      )}
      {collectionType === 'Count' && (
        <NumberInput
          error={get(errors, `subtype_data.entries.${index}.plant_count_collection`)}
          label={'Plant Count'}
          required
          width={Width.Half}
          {...register(`subtype_data.entries.${index}.plant_count_collection`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => greaterThanEqual(val, 1)
          })}
        />
      )}
      {/* Leave empty slot if none selected to avoid whole section changing slot position */}
      {!collectionType && <FormSpacer width={Width.Half} />}
      <SingleSelect
        label={'Collection Method'}
        name={`subtype_data.entries.${index}.collection_method`}
        options={codes?.BioAgentCollectionMethodCode}
        required
        width={Width.Half}
      />
      {collectionMethod === SWEEP_COUNT_CODE ? (
        <NumberInput
          error={get(errors, `subtype_data.entries.${index}.number_of_sweeps`)}
          label={'Number of Sweeps'}
          required
          width={Width.Half}
          {...register(`subtype_data.entries.${index}.number_of_sweeps`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => greaterThanEqual(val, 1)
          })}
        />
      ) : (
        <FormSpacer width={Width.Half} />
      )}
      <DateInput
        error={get(errors, `subtype_data.entries.${index}.start_time_collecting`)}
        includeTime
        label={'Start Time Collecting'}
        required
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.start_time_collecting`, {
          deps: [`subtype_data.entries.${index}.end_time_collecting`],
          required: true,
          validate: {
            noFutureData: (val) => noFutureDate(val),
            startBeforeStop: validateMonitoringStartStopTimes
          }
        })}
      />
      <DateInput
        error={get(errors, `subtype_data.entries.${index}.end_time_collecting`)}
        label={'Stop Time Collecting'}
        includeTime
        required
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.end_time_collecting`, {
          deps: [`subtype_data.entries.${index}.start_time_collecting`],
          required: true,
          validate: {
            noFutureData: (val) => noFutureDate(val),
            startBeforeStop: validateMonitoringStartStopTimes
          }
        })}
      />
      <TextArea
        label={'Comment'}
        tooltip={tooltips.basic.comment}
        width={Width.Half}
        error={get(errors, `subtype_data.entries.${index}.comment`)}
        {...register(`subtype_data.entries.${index}.comment`)}
      />
      <FormSpacer width={Width.Half} />
      <BiocontrolCount index={index} />
      <BiocontrolCount estimate index={index} />
    </>
  );
};

export default BiocontrolCollectionEntry;
