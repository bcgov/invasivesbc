import { ActivityStatus, ActivitySubtypes, ActivitySubtypesToType } from 'sharedAPI';
import {
  getBioControlReleaseSubtypeFields,
  getMonitoringBiocontrolReleaseSubtypeFields,
  getMonitoringChemPlantSubtypeFields,
  getMonitoringMechPlantSubtypeFields,
  getObservationAquaticPlantSubtypeFields,
  getObservationPlantTerrestrialSubtypeFields,
  getTreatmentMechanicalAquaticPlantSubtypeFields,
  getTreatmentMechanicalTerrestrialPlantSubtypeFields,
  getBiocontrolDispersalMonitoringSubtypeFields,
  getBiocontrolCollectionSubtypeFields,
  getTreatmentChemicalPlantSubtypeFields
} from '.';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces/FormSchema';
import createRecordId from 'utils/createRecordId';

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
      return getMonitoringChemPlantSubtypeFields();
    case ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic:
      return getMonitoringMechPlantSubtypeFields();
    case ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial:
      return getTreatmentMechanicalTerrestrialPlantSubtypeFields();
    case ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic:
      return getTreatmentMechanicalAquaticPlantSubtypeFields();
    case ActivitySubtypes.Biocontrol_Release:
      return getBioControlReleaseSubtypeFields();
    case ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial:
      return getMonitoringBiocontrolReleaseSubtypeFields();
    case ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial:
      return getBiocontrolDispersalMonitoringSubtypeFields();
    case ActivitySubtypes.Biocontrol_Collection:
      return getBiocontrolCollectionSubtypeFields();
    case ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial:
    // Intentional fallthrough as state is same for Aquatic/Terrestrial
    case ActivitySubtypes.Treatment_Chemical_Plant_Aquatic:
      return getTreatmentChemicalPlantSubtypeFields();
    default:
      return getObservationPlantTerrestrialSubtypeFields();
  }
};

/**
 * Get the default values needed for a form, used for form create/reset logic.
 */
const getDefaultFormState = (subtype: ActivitySubtypes, created_by?: string): FormSchema => {
  const subtype_data = getSubtypeData(subtype);
  const { id, short_id } = createRecordId(subtype);
  return {
    id,
    short_id,
    employer: [],
    subtype: subtype,
    funding_agencies: [],
    jurisdictions: [{ jurisdiction: '', percent_covered: 0 }],
    projects: [],
    location_description: '',
    access_description: '',
    form_status: ActivityStatus.DRAFT,
    date: new Date().toISOString().slice(0, 10),
    comment: '',
    area_m: 0,
    shape: undefined,
    latitude: 0,
    longitude: 0,
    utm_zone: 0,
    utm_easting: 0,
    utm_northing: 0,
    linked_activities: [],
    participants: [{ name: '', pac_number: undefined }],
    subtype_data: subtype_data,
    type: ActivitySubtypesToType[subtype],
    media: [],
    created_by
  } as FormSchema;
};

export default getDefaultFormState;
