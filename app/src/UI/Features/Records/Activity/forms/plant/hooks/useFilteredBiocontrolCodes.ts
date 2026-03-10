import { useMemo } from 'react';
import { useSelector } from 'utils/use_selector';

const useFilteredBiocontrolCodes = (plantCode: string) => {
  const agentCodes = useSelector((state) => state.ActivityPage?.formCodes?.BiocontrolAgentCode);
  const plantToAgentMap = useSelector((state) => state.ActivityPage.biocontrol?.plantToAgentMap);

  // Filter Available Agent options whenever Plant Selection changes. If agent no longer available, reset selection.
  const agentOptionsForChosenPlant = useMemo(() => {
    if (!agentCodes) return [];
    const agentsForPlant = plantToAgentMap.filter((op) => op.plant_code_name === plantCode);
    const validAgents = agentCodes.filter(({ code }) => agentsForPlant.some((a) => a.agent_code_name === code));
    return validAgents;
  }, [agentCodes, plantCode, plantToAgentMap]);

  return { agentOptionsForChosenPlant };
};

export default useFilteredBiocontrolCodes;
