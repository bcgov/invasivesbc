import { Template } from './definitions.js';
import { ObservationTerrestrialPlant } from './templates/observation_terrestrial_plant.js';
import { ObservationAquaticPlant } from './templates/observation_aquatic_plant.js';
import { BiocontrolRelease } from './templates/biocontrol_release.js';
import { BiocontrolCollection } from './templates/biocontrol_collection.js';
import { MonitoringBiocontrolDispersalTerrestrialPlant } from './templates/monitoring_biocontrol_dispersal_terrestrial_plant.js';
import { MonitoringBiocontrolReleaseTerrestrialPlant } from './templates/monitoring_biocontrol_release_terrestrial_plant.js';
import { MonitoringMechanical } from './templates/monitoring_mechanical_treatment.js';
import { MonitoringChemical } from './templates/monitoring_chemical_treatment.js';
import { TreatmentChemicalTerrestrialPlant } from './templates/treatment_chemical_terrestrial_plant.js';
import { TreatmentChemicalAquaticPlant } from './templates/treatment_chemical_aquatic_plant.js';
import { TreatmentMechanicalAquaticPlant } from './templates/treatment_mechanical_aquatic_plant.js';
import { TreatmentMechanicalTerrestrialPlant } from './templates/treatment_mechanical_terrestrial_plant.js';
import { getDBConnection } from '../../database/db.js';
import { PoolClient } from 'pg';
import { ObservationTerrestrialPlantTemp } from './templates/observation_terrestrial_plant_temp.js';
import { TreatmentChemicalTerrestrialPlantTemp } from './templates/treatment_chemical_terrestrial_plant_temp.js';
import { TreatmentMechanicalTerrestrialPlantTemp } from './templates/treatment_mechanical_terrestrial_plant_temp.js';
import { ObservationAquaticPlantTemp } from './templates/observation_aquatic_plant_temp.js';
import { TreatmentChemicalAquaticPlantTemp } from './templates/treatment_chemical_aquatic_plant_temp.js';
import { TreatmentMechanicalAquaticPlantTemp } from './templates/treatment_mechanical_aquatic_plant_temp.js';

const templateList: Template[] = [
  ObservationTerrestrialPlant,
  ObservationTerrestrialPlantTemp,
  ObservationAquaticPlant,
  ObservationAquaticPlantTemp,
  BiocontrolCollection,
  BiocontrolRelease,
  MonitoringBiocontrolDispersalTerrestrialPlant,
  MonitoringBiocontrolReleaseTerrestrialPlant,
  MonitoringChemical,
  MonitoringMechanical,
  TreatmentChemicalTerrestrialPlant,
  TreatmentChemicalTerrestrialPlantTemp,
  TreatmentChemicalAquaticPlant,
  TreatmentChemicalAquaticPlantTemp,
  TreatmentMechanicalTerrestrialPlant,
  TreatmentMechanicalTerrestrialPlantTemp,
  TreatmentMechanicalAquaticPlant,
  TreatmentMechanicalAquaticPlantTemp
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
