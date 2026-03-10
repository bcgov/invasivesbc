import { useFormContext } from 'react-hook-form';
import { BiocontrolCollectionSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';
import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { MonitoringType } from 'UI/Features/Records/Activity/forms/enums';
import { minValue } from 'UI/Features/Records/Activity/forms/common/validators';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import EmptySpace from 'UI/Features/Records/Activity/forms/common/EmptySpace/EmptySpace';
import BiocontrolCount from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/BiocontrolCount';

type PropTypes = {
  index: number;
  remove: (idx: number) => void;
};
const BiocontrolCollectionEntry = ({ index, remove }: PropTypes) => {
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext<BiocontrolCollectionSchema>();
  const SWEEP_COUNT_CODE = 'Cs';
  const codes = useSelector((state) => state.ActivityPage.formCodes);

  const collectionType = watch(`subtype_data.entries.${index}.collection_type`);
  const collectionMethod = watch(`subtype_data.entries.${index}.collection_method`);

  return (
    <>
      <SingleSelect
        label={'Invasive Plant'}
        options={codes.TerrestrialPlantCode}
        tooltip={tooltips.plant.invasive_plant}
        rules={{ required: true }}
        width={Width.Half}
        name={`subtype_data.entries.${index}.invasive_plant`}
        required
      />
      <SingleSelect
        label={'Biological Control Agent'}
        required
        options={codes.BiocontrolAgentCode}
        rules={{ required: true }}
        width={Width.Half}
        name={`subtype_data.entries.${index}.biological_agent`}
      />
      <NumberInput
        label={'Historical IAPP Site ID'}
        width={Width.Half}
        tooltip={'TODO'}
        error={errors?.subtype_data?.entries?.[index]?.historical_iapp_site}
        {...register(`subtype_data.entries.${index}.historical_iapp_site`, { valueAsNumber: true })}
      />
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
          error={errors?.subtype_data?.[index]?.count_duration_minutes}
          label={'Count duration (Minutes)'}
          required
          tooltip={tooltips.plant.biocontrol.monitoring.count}
          width={Width.Half}
          {...register(`subtype_data.entries.${index}.time_collection_duration_minutes`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => minValue(val!, 1)
          })}
        />
      )}
      {collectionType === 'Count' && (
        <NumberInput
          error={errors?.subtype_data?.[index]?.plant_count}
          label={'Plant Count'}
          required
          width={Width.Half}
          {...register(`subtype_data.entries.${index}.plant_count_collection`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => minValue(val!, 1)
          })}
        />
      )}
      {/* Leave empty slot if none selected to avoid whole section changing slot position */}
      {!collectionType && <EmptySpace width={Width.Half} />}
      <SingleSelect
        label={'Collection Method'}
        name={`subtype_data.entries.${index}.collection_method`}
        options={codes?.BioAgentCollectionMethodCode}
        required
        width={Width.Half}
      />
      {collectionMethod === SWEEP_COUNT_CODE ? (
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
        <EmptySpace width={Width.Half} />
      )}
      <TextArea
        label={'Comment'}
        tooltip={'TODO'}
        width={Width.Half}
        error={errors?.subtype_data?.entries?.[index]?.comment}
        {...register(`subtype_data.entries.${index}.comment`)}
      />
      <BiocontrolCount index={index} />
      <BiocontrolCount estimate index={index} />
      <DeleteControl onClick={() => remove(index)} />
    </>
  );
};

export default BiocontrolCollectionEntry;
