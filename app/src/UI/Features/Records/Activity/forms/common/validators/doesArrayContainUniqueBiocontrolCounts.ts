type BiocontrolCountEntry = {
  quantity: number;
  stage: string;
  plant_position?: string;
  agent_location?: string;
};
/**
 * @desc Checks all entries in a Biocontrol Count array to ensure unique combination of agent lifestage, plant position, agent locations.
 */
const doesArrayContainUniqueBiocontrolCounts = (arr: Array<BiocontrolCountEntry>): true | string => {
  const seen = new Set<string>();

  for (const item of arr) {
    const key = `${item.stage}-${item.plant_position}-${item.agent_location}`;
    if (seen.has(key)) {
      return 'Agent Entries must be unique';
    }
    seen.add(key);
  }
  return true;
};

export default doesArrayContainUniqueBiocontrolCounts;
