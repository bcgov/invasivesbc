import { useMemo } from 'react';
import { useSelector } from 'utils/use_selector';

const useFilteredInvasivePlantCodes = () => {
  const terrestrialPlantCodes = useSelector((state) => state.ActivityPage?.formCodes?.TerrestrialPlantCode);
  const plantToAgentMap = useSelector((state) => state.ActivityPage.biocontrol?.plantToAgentMap);

  // Only Display Invasive Plants where matching agents exist
  const terrestrialPlantOptionsWithAgents = useMemo(() => {
    if (!plantToAgentMap || !terrestrialPlantCodes) return [];
    return terrestrialPlantCodes.filter(({ code }) => plantToAgentMap.some((p) => p.plant_code_name === code));
  }, [plantToAgentMap, terrestrialPlantCodes]);

  return { terrestrialPlantOptionsWithAgents };
};
export default useFilteredInvasivePlantCodes;
