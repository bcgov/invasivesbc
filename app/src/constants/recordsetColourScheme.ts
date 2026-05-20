const MONITORING = '#2138e0';
const OBSERVATION = '#399c3e';
const TREATMENT = '#c6c617';
const BIOCONTROL = '#845ec2';

const recordsetColourScheme = {
  // Backwards Compatibility
  Activity_Biocontrol_Collection: BIOCONTROL,
  Activity_Biocontrol_Release: BIOCONTROL,
  Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant: BIOCONTROL,
  Activity_Monitoring_BiocontrolRelease_TerrestrialPlant: BIOCONTROL,
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant: MONITORING,
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant: MONITORING,
  Activity_Observation_PlantAquatic: OBSERVATION,
  Activity_Observation_PlantTerrestrial: OBSERVATION,
  Activity_Treatment_ChemicalPlantAquatic: TREATMENT,
  Activity_Treatment_ChemicalPlantTerrestrial: TREATMENT,
  Activity_Treatment_MechanicalPlantAquatic: TREATMENT,
  Activity_Treatment_MechanicalPlantTerrestrial: TREATMENT,
  // New names
  Observation_Plant_Terrestrial: OBSERVATION,
  Observation_Plant_Aquatic: OBSERVATION,
  Monitoring_Chemical_Plant_Terrestrial_Aquatic: MONITORING,
  Monitoring_Mechanical_Plant_Terrestrial_Aquatic: MONITORING,
  Treatment_Mechanical_Plant_Terrestrial: TREATMENT,
  Treatment_Mechanical_Plant_Aquatic: TREATMENT,
  Treatment_Chemical_Plant_Terrestrial: TREATMENT,
  Treatment_Chemical_Plant_Aquatic: TREATMENT,
  Monitoring_Biocontrol_Release_Plant_Terrestrial: BIOCONTROL,
  Monitoring_Biocontrol_Dispersal_Plant_Terrestrial: BIOCONTROL,
  Biocontrol_Collection: BIOCONTROL,
  Biocontrol_Release: BIOCONTROL
};

export default recordsetColourScheme;
