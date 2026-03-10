import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { YesNoUnknown } from 'UI/Features/Records/Activity/forms/enums';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { useFormContext } from 'react-hook-form';
import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { minValue, noFutureDate } from 'UI/Features/Records/Activity/forms/common/validators';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import { useMemo } from 'react';
import BiocontrolCount from '../common/BiocontrolCount';

interface PropTypes {
  index: number;
  remove: (index: number) => void;
}
const BiocontrolReleaseEntry = ({ index, remove }: PropTypes) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useFormContext<BiocontrolReleaseSchema>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const plantToAgentMap = useSelector((state) => state.ActivityPage.biocontrol?.plantToAgentMap);
  const selectedPlant = watch(`subtype_data.entries.${index}.invasive_plant`);
  const selectedAgent = watch(`subtype_data.entries.${index}.biocontrol_agent`);

  // Only Display Invasive Plants where matching agents exist
  const plantOptionsWithAgents = useMemo(() => {
    if (!plantToAgentMap || !codes?.TerrestrialPlantCode) return [];
    return codes.TerrestrialPlantCode.filter(({ code }) => plantToAgentMap.some((p) => p.plant_code_name === code));
  }, [plantToAgentMap]);

  // Filter Available Agent options whenever Plant Selection changes. If agent no longer available, reset selection.
  const agentOptionsForChosenPlant = useMemo(() => {
    if (!codes?.BiocontrolAgentCode) return [];
    const agentsForPlant = plantToAgentMap.filter((op) => op.plant_code_name === selectedPlant);
    const validAgents = codes.BiocontrolAgentCode.filter(({ code }) =>
      agentsForPlant.some((a) => a.agent_code_name === code)
    );
    const currentSelectionNoLongerValid = selectedAgent && !validAgents.some(({ code }) => code === selectedAgent);
    if (currentSelectionNoLongerValid && isDirty) {
      setValue(`subtype_data.entries.${index}.biocontrol_agent`, '');
    }
    return validAgents;
  }, [selectedPlant]);

  return (
    <>
      <SingleSelect
        label={'Invasive Plant'}
        name={`subtype_data.entries.${index}.invasive_plant`}
        options={plantOptionsWithAgents}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.invasive_plant}
        width={Width.Half}
      />
      <SingleSelect
        label={'Biological Agent'}
        name={`subtype_data.entries.${index}.biocontrol_agent`}
        options={agentOptionsForChosenPlant}
        required
        noOptionsMessage={'Select an Invasive Plant to see options'}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.agent}
        width={Width.Half}
      />
      <SingleSelect
        label={'Linear Segment'}
        name={`subtype_data.entries.${index}.linear_segment`}
        options={YesNoUnknown}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.linear_segment}
        width={Width.Half}
      />
      <NumberInput
        label={'Mortality'}
        error={errors?.subtype_data?.entries?.[index]?.mortality}
        required
        tooltip={tooltips.plant.biocontrol.mortality}
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.mortality`, {
          required: true,
          valueAsNumber: true,
          validate: (val) => minValue(val, 0)
        })}
      />
      <TextInput
        error={errors?.subtype_data?.entries?.[index]?.agent_source}
        label={'Agent Source'}
        required
        tooltip={tooltips.plant.biocontrol.agent_source}
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.agent_source`, { required: true })}
      />
      <DateInput
        defaultValue={new Date().toISOString().slice(0, 10)}
        error={errors?.subtype_data?.entries?.[index]?.collection_date}
        includeTime
        label={'Collection Date'}
        required
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.collection_date`, {
          validate: (val) => noFutureDate(val)
        })}
      />
      <SingleSelect
        label={'Plant Collected From'}
        name={`subtype_data.entries.${index}.plant_collected_from`}
        options={codes?.TerrestrialPlantCode}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.plant_collected_from}
        width={Width.Half}
      />
      <TextInput
        label={'Plant Collected From (Unlisted)'}
        tooltip={tooltips.plant.biocontrol.plant_collected_from_manual}
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.plant_collected_from_manual`)}
      />
      {/* Biocontrol Agent Count Section (Actuals) */}
      <BiocontrolCount index={index} />
      <BiocontrolCount estimate index={index} />
      <DeleteControl onClick={() => remove(index)} />
    </>
  );
};

export default BiocontrolReleaseEntry;
