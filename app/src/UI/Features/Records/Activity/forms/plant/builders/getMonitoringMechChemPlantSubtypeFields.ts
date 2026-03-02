import { MonitoringChemPlantSchema, MonitoringMechPlantSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getSubtypeFields = (): MonitoringChemPlantSchema['subtype_data'] | MonitoringMechPlantSchema['subtype_data'] => ({
  entries: [
    {
      invasive_plant: '',
      evidence_of_treatment: '',
      treatment_pass: '',
      comment: '',
      invasive_plants_on_site: [],
      management_efficacy_rating: '',
      treatment_efficacy_rating: '',
      invasive_plant_aquatic: ''
    }
  ]
});

const getMonitoringMechPlantSubtypeFields = (): MonitoringMechPlantSchema['subtype_data'] => getSubtypeFields();
const getMonitoringChemPlantSubtypeFields = (): MonitoringChemPlantSchema['subtype_data'] => getSubtypeFields();

export { getMonitoringChemPlantSubtypeFields, getMonitoringMechPlantSubtypeFields };
