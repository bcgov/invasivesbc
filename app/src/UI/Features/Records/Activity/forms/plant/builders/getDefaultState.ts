import { ActivitySubtypes } from 'sharedAPI';
import getObservationAquaticPlantSubtypeFields from './getObservationAquaticPlantSubtypeFields';
import getObservationPlantTerrestrialSubtypeFields from './getObservationTerrestrialPlantSubtypeFields';
import getTreatmentMechanicalTerrestrialPlantSubtypeFields from './getTreatmentMechanicalTerrestrialPlantSubtypeFields';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces/FormSchema';

/**
 * @desc Intermediate function to map subtypes to their proper empty values
 * @param subtype Subtype to create
 */
const getSubtypeData = (subtype: ActivitySubtypes): FormSchema['subtype_data'] => {
  switch (subtype) {
    case ActivitySubtypes.Observation_Plant_Terrestrial:
      return getObservationPlantTerrestrialSubtypeFields();
    case ActivitySubtypes.Observation_Plant_Aquatic:
      return getObservationAquaticPlantSubtypeFields();
    case ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic:
    case ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic:
    case ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial:
    case ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial:
      return getTreatmentMechanicalTerrestrialPlantSubtypeFields();
    case ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic:
    case ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial:
    case ActivitySubtypes.Treatment_Chemical_Plant_Aquatic:
    case ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial:
    case ActivitySubtypes.Biocontrol_Collection:
    case ActivitySubtypes.Biocontrol_Release:
    default:
      return getObservationPlantTerrestrialSubtypeFields();
  }
};

/**
 * Get the default values needed for a form, used for form create/reset logic.
 */
const getDefaultFormState = (
  subtype: ActivitySubtypes = ActivitySubtypes.Observation_Plant_Terrestrial
): FormSchema => {
  const subtype_data = getSubtypeData(subtype);
  const isChemical = [
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic,
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial
  ].some((st) => st === subtype);

  return {
    employer: '',
    subtype: subtype,
    funding_agencies: [{ invasive_species_agency_code: '' }],
    jurisdictions: [{ jurisdiction: '', percent_covered: 0 }],
    projects: [{ description: '' }],
    location_description: '',
    access_description: '',
    comment: '',
    area_m: 0,
    geom: undefined,
    latitude: 0,
    longitude: 0,
    utm_zone: 0,
    utm_easting: 0,
    utm_northing: 0,
    participant: [{ name: '', ...(isChemical && { pac_number: '' }) }],
    subtype_data: subtype_data
  };
};

export default getDefaultFormState;
