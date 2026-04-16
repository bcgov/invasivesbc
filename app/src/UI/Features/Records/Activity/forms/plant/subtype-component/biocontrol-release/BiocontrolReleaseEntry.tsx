import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { YesNoUnknown } from 'UI/Features/Records/Activity/forms/enums';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { get, useFormContext } from 'react-hook-form';
import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { greaterThanEqual, noFutureDate } from 'UI/Features/Records/Activity/forms/common/validators';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import { useEffect } from 'react';
import BiocontrolCount from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/BiocontrolCount';
import useFilteredInvasivePlantCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredInvasivePlantCodes';
import useFilteredBiocontrolCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useFilteredBiocontrolCodes';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

interface PropTypes {
  index: number;
}
const BiocontrolReleaseEntry = ({ index }: PropTypes) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useFormContext<BiocontrolReleaseSchema>();
  const { getPath } = useFieldPath<BiocontrolReleaseSchema>(`subtype_data.entries.${index}`);

  const selectedPlant = watch(getPath('invasive_plant'));
  const selectedAgent = watch(getPath('biocontrol_agent'));
  const { terrestrialPlantOptionsWithAgents } = useFilteredInvasivePlantCodes();
  const { agentOptionsForChosenPlant } = useFilteredBiocontrolCodes(selectedPlant);

  useEffect(() => {
    const currentSelectionNoLongerValid =
      selectedAgent && !agentOptionsForChosenPlant.some(({ code }) => code === selectedAgent);
    if (currentSelectionNoLongerValid && isDirty) {
      setValue(getPath('biocontrol_agent'), '');
    }
  }, [agentOptionsForChosenPlant]);

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
        label={'Biological Agent'}
        name={getPath('biocontrol_agent')}
        options={agentOptionsForChosenPlant}
        required
        noOptionsMessage={'Select an Invasive Plant to see options'}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.agent}
        width={Width.Half}
      />
      <SingleSelect
        label={'Linear Segment'}
        name={getPath('linear_segment')}
        options={YesNoUnknown}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.linear_segment}
        width={Width.Half}
      />
      <NumberInput
        label={'Mortality'}
        error={get(errors, getPath('mortality'))}
        required
        tooltip={tooltips.plant.biocontrol.mortality}
        width={Width.Half}
        {...register(getPath('mortality'), {
          required: true,
          valueAsNumber: true,
          validate: (val) => greaterThanEqual(val, 0)
        })}
      />
      <TextInput
        error={get(errors, getPath('agent_source'))}
        label={'Agent Source'}
        required
        tooltip={tooltips.plant.biocontrol.agent_source}
        width={Width.Half}
        {...register(getPath('agent_source'), { required: true })}
      />
      <DateInput
        defaultValue={new Date().toISOString().slice(0, 10)}
        error={get(errors, getPath('collection_date'))}
        includeTime
        label={'Collection Date'}
        required
        width={Width.Half}
        {...register(getPath('collection_date'), {
          validate: (val) => noFutureDate(val)
        })}
      />
      <SingleSelect
        label={'Plant Collected From'}
        name={getPath('plant_collected_from')}
        options={terrestrialPlantOptionsWithAgents}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.plant_collected_from}
        width={Width.Half}
      />
      <TextInput
        label={'Plant Collected From (Unlisted)'}
        tooltip={tooltips.plant.biocontrol.plant_collected_from_manual}
        error={get(errors, getPath('plant_collected_from_manual'))}
        width={Width.Half}
        {...register(getPath('plant_collected_from_manual'))}
      />
      {/* Biocontrol Agent Count Section (Actuals) */}
      <BiocontrolCount index={index} />
      <BiocontrolCount estimate index={index} />
    </>
  );
};

export default BiocontrolReleaseEntry;
