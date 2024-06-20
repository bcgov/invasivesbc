import { PoolClient } from 'pg';
import { Template } from './definitions';
import { ObservationTerrestrialPlant } from './templates/observation_terrestrial_plant';
import { ObservationAquaticPlant } from './templates/observation_aquatic_plant';
import { BiocontrolRelease } from './templates/biocontrol_release';
import { BiocontrolCollection } from './templates/biocontrol_collection';
import { MonitoringBiocontrolDispersalTerrestrialPlant } from './templates/monitoring_biocontrol_dispersal_terrestrial_plant';
import { MonitoringMechanical } from './templates/monitoring_mechanical_treatment';
import { MonitoringChemical } from './templates/monitoring_chemical_treatment';
import { TreatmentChemicalTerrestrialPlant } from './templates/treatment_chemical_terrestrial_plant';
import { TreatmentChemicalAquaticPlant } from './templates/treatment_chemical_aquatic_plant';
import { TreatmentMechanicalAquaticPlant } from './templates/treatment_mechanical_aquatic_plant';
import { TreatmentMechanicalTerrestrialPlant } from './templates/treatment_mechanical_terrestrial_plant';
import { ObservationTerrestrialPlantTemp } from './templates/observation_terrestrial_plant_temp';
import { TreatmentChemicalTerrestrialPlantTemp } from './templates/treatment_chemical_terrestrial_plant_temp';
import { TreatmentMechanicalTerrestrialPlantTemp } from './templates/treatment_mechanical_terrestrial_plant_temp';
import { ObservationAquaticPlantTemp } from './templates/observation_aquatic_plant_temp';
import { TreatmentChemicalAquaticPlantTemp } from './templates/treatment_chemical_aquatic_plant_temp';
import { TreatmentMechanicalAquaticPlantTemp } from './templates/treatment_mechanical_aquatic_plant_temp';
import { getDBConnection } from 'database/db';
import { BiocontrolReleaseTemp } from './templates/biocontrol_release_temp';
import { BiocontrolCollectionTemp } from './templates/biocontrol_collection_temp';
import { MonitoringBiocontrolDispersalTerrestrialPlantTemp } from './templates/monitoring_biocontrol_dispersal_terrestrial_plant_temp';
import { MonitoringChemicalTemp } from './templates/monitoring_chemical_treatment_temp';
import { MonitoringMechanicalTemp } from './templates/monitoring_mechanical_treatment_temp';

const templateList: Template[] = [
  ObservationTerrestrialPlant,
  ObservationTerrestrialPlantTemp,
  ObservationAquaticPlant,
  ObservationAquaticPlantTemp,
  TreatmentChemicalTerrestrialPlant,
  TreatmentChemicalTerrestrialPlantTemp,
  TreatmentChemicalAquaticPlant,
  TreatmentChemicalAquaticPlantTemp,
  TreatmentMechanicalTerrestrialPlant,
  TreatmentMechanicalTerrestrialPlantTemp,
  TreatmentMechanicalAquaticPlant,
  TreatmentMechanicalAquaticPlantTemp,
  MonitoringChemical,
  MonitoringChemicalTemp,
  MonitoringMechanical,
  MonitoringMechanicalTemp,
  BiocontrolRelease,
  BiocontrolReleaseTemp,
  BiocontrolCollection,
  BiocontrolCollectionTemp,
  MonitoringBiocontrolDispersalTerrestrialPlant,
  MonitoringBiocontrolDispersalTerrestrialPlantTemp
];

export const TemplateService = {
  listTemplatesShallow: async () => {
    return templateList.map((t) => ({
      name: t.name,
      key: t.key
    }));
  },

  listTemplates: async () => {
    const dbConnection = await getDBConnection();

    try {
      for (const t of templateList) {
        await t.hydrateAllCodes(dbConnection);
      }
    } finally {
      dbConnection.release();
    }

    return templateList;
  },

  getTemplateWithExistingDBConnection: async (key: string, dbConnection: PoolClient) => {
    const found = templateList.find((t) => t.key === key);

    if (!found) {
      throw new Error('No matching template found');
    }

    await found.hydrateAllCodes(dbConnection);

    return found;
  },

  getTemplate: async (key: string) => {
    const dbConnection = await getDBConnection();

    try {
      const found = templateList.find((t) => t.key === key);

      if (!found) {
        throw new Error('No matching template found');
      }

      await found.hydrateAllCodes(dbConnection);

      return found;
    } finally {
      dbConnection.release();
    }
  }
};
