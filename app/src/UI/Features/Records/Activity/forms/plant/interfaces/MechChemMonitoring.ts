import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from './BaseForm';

interface MonitoringChemMech extends BaseForm {
  subtype_data: {
    entries: Array<{
      invasive_plant: string;
      evidence_of_treatment: string;
      treatment_pass: string;
      comment: string;
      invasive_plants_on_site: string[];
      management_efficacy_rating: string;
      treatment_efficacy_rating: string;
      invasive_plant_aquatic: string;
    }>;
  };
}

interface MonitoringChemPlantSchema extends MonitoringChemMech {
  subtype: ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic;
}
interface MonitoringMechPlantSchema extends MonitoringChemMech {
  subtype: ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic;
}

export type { MonitoringChemPlantSchema, MonitoringMechPlantSchema };
