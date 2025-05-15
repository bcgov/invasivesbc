import { ActivitySubtype } from '../constants';

/**
 * @desc Permission Categories. Each role has its own set of rules per each Category
 */
export enum EPermission_Category {
  PLANT_OBSERVATION = 'PLANT_OBSERVATION',
  ANIMAL_OBSERVATION = 'ANIMAL_OBSERVATION',
  PLANT_TREATMENT_MONITORING = 'PLANT_TREATMENT_MONITORING',
  ANIMAL_TREATMENT_MONITORING = 'ANIMAL_TREATMENT_MONITORING',
  PLANT_TRANSECT = 'PLANT_TRANSECT',
  ANIMAL_TRANSECT = 'ANIMAL_TRANSECT',
  PLANT_BIOCONTROL = 'PLANT_BIOCONTROL'
}

/**
 * @desc Interface for a Permissions entry.
 * @propertykey ID - Category permission applies to.
 */
export interface IPermission {
  id: EPermission_Category;
  can_write: boolean;
  can_read: boolean;
  can_delete: boolean;
  can_delete_employer: boolean;
  can_delete_agency: boolean;
  can_edit: boolean;
  can_edit_employer: boolean;
  can_edit_agency: boolean;
  can_review_and_publish: boolean;
  can_review_and_publish_employer: boolean;
  can_review_and_publish_agency: boolean;
  can_assign_access_levels: boolean;
}

/**
 * @desc Permissions Enum for consistency. By default a User can Edit/Delete THEIR OWN records.
 * @propertykey WRITE            Can Create a Record under category type
 * @propertykey READ             Can Read Records under category type
 * @propertykey DELETE           Can delete ANY record under category type
 * @propertykey DELETE_EMPLOYER  Can delete record under category type if EMPLOYER matches
 * @propertykey DELETE_AGENCY    Can delete record under category type if AGENCY matched
 * @propertykey EDIT             Can edit ANY record
 * @propertykey EDIT_EMPLOYER    Can edit Records under category type if EMPLOYER matches
 * @propertykey EDIT_AGENCY      Can edit records category type if AGENCY matched
 * @propertykey REVIEW           Can review and publish any record under category type.
 * @propertykey REVIEW_EMPLOYER  Can review and publish records under category type if EMPLOYER matches
 * @propertykey REVIEW_AGENCY    Can review and publish records under category type if AGENCY matched
 * @propertykey ASSIGN_ACCESS    Can assign access permissions to user
 */
export enum EPermission {
  WRITE = 'can_write',
  READ = 'can_read',
  DELETE = 'can_delete',
  DELETE_EMPLOYER = 'can_delete_employer',
  DELETE_AGENCY = 'can_delete_agency',
  EDIT = 'can_edit',
  EDIT_EMPLOYER = 'can_edit_employer',
  EDIT_AGENCY = 'can_edit_agency',
  REVIEW = 'can_review_and_publish',
  REVIEW_EMPLOYER = 'can_review_and_publish_employer',
  REVIEW_AGENCY = 'can_review_and_publish_agency',
  ASSIGN_ACCESS = 'can_assign_access_levels'
}

export const ActivitySubtypePermissionCategory = {
  [ActivitySubtype.Transect_BiocontrolEfficacy]: [
    EPermission_Category.PLANT_TREATMENT_MONITORING,
    EPermission_Category.PLANT_BIOCONTROL
  ],
  [ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant]: [EPermission_Category.PLANT_TREATMENT_MONITORING],
  [ActivitySubtype.Monitoring_ChemicalAnimalTerrestrial]: [EPermission_Category.ANIMAL_TREATMENT_MONITORING],
  [ActivitySubtype.Treatment_BiologicalPlant]: [
    EPermission_Category.PLANT_TREATMENT_MONITORING,
    EPermission_Category.PLANT_BIOCONTROL
  ],
  [ActivitySubtype.Monitoring_MechanicalAnimalTerrestrial]: [EPermission_Category.ANIMAL_TREATMENT_MONITORING],
  [ActivitySubtype.Treatment_MechanicalAnimalTerrestrial]: [EPermission_Category.ANIMAL_TREATMENT_MONITORING],
  [ActivitySubtype.Monitoring_BiologicalTerrestrialPlant]: [
    EPermission_Category.PLANT_TREATMENT_MONITORING,
    EPermission_Category.PLANT_BIOCONTROL
  ],
  [ActivitySubtype.Treatment_ChemicalAnimalTerrestrial]: [EPermission_Category.ANIMAL_TREATMENT_MONITORING],
  [ActivitySubtype.Monitoring_BiologicalDispersal]: [
    EPermission_Category.PLANT_TREATMENT_MONITORING,
    EPermission_Category.PLANT_BIOCONTROL
  ],
  [ActivitySubtype.Observation_PlantAquatic]: [EPermission_Category.PLANT_OBSERVATION],
  [ActivitySubtype.Activity_AnimalAquatic]: [EPermission_Category.ANIMAL_OBSERVATION],
  [ActivitySubtype.Treatment_ChemicalPlant]: [EPermission_Category.PLANT_TREATMENT_MONITORING],
  [ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant]: [EPermission_Category.PLANT_TREATMENT_MONITORING],
  [ActivitySubtype.Treatment_MechanicalPlantAquatic]: [EPermission_Category.PLANT_TREATMENT_MONITORING],
  [ActivitySubtype.Observation_PlantTerrestrial]: [EPermission_Category.PLANT_OBSERVATION],
  [ActivitySubtype.Collection_Biocontrol]: [
    EPermission_Category.PLANT_TREATMENT_MONITORING,
    EPermission_Category.PLANT_BIOCONTROL
  ],
  [ActivitySubtype.Treatment_ChemicalPlantAquatic]: [EPermission_Category.PLANT_TREATMENT_MONITORING],
  [ActivitySubtype.Activity_AnimalTerrestrial]: [EPermission_Category.ANIMAL_OBSERVATION],
  [ActivitySubtype.Treatment_MechanicalPlant]: [EPermission_Category.PLANT_TREATMENT_MONITORING]
};
