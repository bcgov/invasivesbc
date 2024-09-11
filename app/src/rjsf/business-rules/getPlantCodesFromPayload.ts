enum Subtypes {
  Collection = 'Biocontrol_Collection_Information',
  Release = 'Biocontrol_Release_Information',
  Dispersal = 'Monitoring_BiocontrolDispersal_Information',
  ReleaseMonitoring = 'Monitoring_BiocontrolRelease_TerrestrialPlant_Information'
}

/**
 * @property {string | undefined} prevPlantCode Plant code from previous state
 * @property {string | undefined} plantCode Plant code from updated state
 * @property {string | undefined} agentListTarget Unique property variant for this form type
 */
interface Response {
  plantCode: string;
  prevPlantCode: string;
  agentListTarget: string;
}

/**
 * @summary Parses Before and after state of form data to get codes for Invasive Plants
 * @desc Helper function for updating Biocontrol type forms.
 *       There are four types of forms that all use the same invasive_plant_code key, but are held by a separate property key
 *       This finds the version of the form currently being used, and returns the plantCodes along with its unique property key
 * @param {Record<string,any>} beforeState Form state before updates occur
 * @param {Record<string, any>} updateState Form state after resolution
 * @returns {Response}
 */
const getPlantCodesFromPayload = (beforeState: Record<string, any>, updateState: Record<string, any>): Response => {
  const parsedUpdateState = updateState?.activity_subtype_data ?? {};
  let agentListTarget: string = '';

  if (parsedUpdateState.hasOwnProperty(Subtypes.Collection)) {
    agentListTarget = Subtypes.Collection;
  } else if (parsedUpdateState.hasOwnProperty(Subtypes.Release)) {
    agentListTarget = Subtypes.Release;
  } else if (parsedUpdateState.hasOwnProperty(Subtypes.Dispersal)) {
    agentListTarget = Subtypes.Dispersal;
  } else if (parsedUpdateState.hasOwnProperty(Subtypes.ReleaseMonitoring)) {
    agentListTarget = Subtypes.ReleaseMonitoring;
  }

  const prevPlantCode = beforeState?.activity_subtype_date?.[agentListTarget]?.[0]?.invasive_plant_code;
  const plantCode = parsedUpdateState?.[agentListTarget]?.[0]?.invasive_plant_code;

  return {
    plantCode,
    prevPlantCode,
    agentListTarget
  } as Response;
};
export default getPlantCodesFromPayload;
