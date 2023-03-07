import {Template} from "./definitions";
import {ObservationTerrestrialPlant} from "./templates/observation_terrestrial_plant";
import {ObservationAquaticPlant} from "./templates/observation_aquatic_plant";
import {BiocontrolRelease} from "./templates/biocontrol_release";
import {BiocontrolCollection} from "./templates/biocontrol_collection";
import {
  MonitoringBiocontrolDispersalTerrestrialPlant
} from "./templates/monitoring_biocontrol_dispersal_terrestrial_plant";
import {MonitoringBiocontrolReleaseTerrestrialPlant} from "./templates/monitoring_biocontrol_release_terrestrial_plant";
import {MonitoringMechanical} from "./templates/monitoring_mechanical_treatment";
import {MonitoringChemical} from "./templates/monitoring_chemical_treatment";
import {TreatmentChemicalTerrestrialPlant} from "./templates/treatment_chemical_terrestrial_plant";
import {TreatmentChemicalAquaticPlant} from "./templates/treatment_chemical_aquatic_plant";
import {TreatmentMechanicalAquaticPlant} from "./templates/treatment_mechanical_aquatic_plant";
import {TreatmentMechanicalTerrestrialPlant} from "./templates/treatment_mechanical_terrestrial_plant";

const templateList: Template[] = [
  ObservationAquaticPlant,
  ObservationTerrestrialPlant,
  BiocontrolCollection,
  BiocontrolRelease,
  MonitoringBiocontrolDispersalTerrestrialPlant,
  MonitoringBiocontrolReleaseTerrestrialPlant,
  MonitoringChemical,
  MonitoringMechanical,
  TreatmentChemicalAquaticPlant,
  TreatmentChemicalTerrestrialPlant,
  TreatmentMechanicalAquaticPlant,
  TreatmentMechanicalTerrestrialPlant
];

export {templateList};
