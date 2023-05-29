import {Template} from './definitions';
import {ObservationTerrestrialPlant} from './templates/observation_terrestrial_plant';
import {ObservationAquaticPlant} from './templates/observation_aquatic_plant';
import {BiocontrolRelease} from './templates/biocontrol_release';
import {BiocontrolCollection} from './templates/biocontrol_collection';
import {
  MonitoringBiocontrolDispersalTerrestrialPlant
} from './templates/monitoring_biocontrol_dispersal_terrestrial_plant';
import {MonitoringBiocontrolReleaseTerrestrialPlant} from './templates/monitoring_biocontrol_release_terrestrial_plant';
import {MonitoringMechanical} from './templates/monitoring_mechanical_treatment';
import {MonitoringChemical} from './templates/monitoring_chemical_treatment';
import {TreatmentChemicalTerrestrialPlant} from './templates/treatment_chemical_terrestrial_plant';
import {TreatmentChemicalAquaticPlant} from './templates/treatment_chemical_aquatic_plant';
import {TreatmentMechanicalAquaticPlant} from './templates/treatment_mechanical_aquatic_plant';
import {TreatmentMechanicalTerrestrialPlant} from './templates/treatment_mechanical_terrestrial_plant';
import {getDBConnection} from '../../database/db';
import {PoolClient} from "pg";
import { ObservationTerrestrialPlantTemp } from './templates/observation_terrestrial_plant_temp';
import { TreatmentChemicalTerrestrialPlantTemp } from './templates/treatment_chemical_terrestrial_plant_temp';

const templateList: Template[] = [
  ObservationTerrestrialPlantTemp,
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
  TreatmentChemicalTerrestrialPlantTemp,
  TreatmentMechanicalAquaticPlant,
  TreatmentMechanicalTerrestrialPlant
];

export const TemplateService = {

  listTemplatesShallow: async () => {
    return templateList.map(t => ({
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
