import { useSelector } from 'utils/use_selector';
import DeleteControl from '../../../common/DeleteControl/DeleteControl';
import SingleSelect from '../../../common/SingleSelect/SingleSelect';
import { useFormContext } from 'react-hook-form';
import { BiocontrolReleaseMonitoringSchema } from '../../interfaces';
import { useMemo } from 'react';

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
        name={`subtype_data.entries.${index}.invasive_plant`}
        options={codes.TerrestrialPlantCode}
        label={'Invasive Plant'}
      />
      <DeleteControl onClick={() => remove(index)} />
    </>
  );
};

export default BiocontrolReleaseMonitoringEntry;
