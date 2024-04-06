import { Activity_FREP_FormC } from './Activities/FREP/FREP';
import { Activity_Biocontrol_Collection, Activity_Biocontrol_Release } from './Activities/Plant/Biocontrol';
import {
  Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant,
  Activity_Monitoring_BiocontrolRelease_TerrestrialPlant,
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant,
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant
} from './Activities/Plant/Monitorings';
import {
  Activity_Observation_PlantAquatic,
  Activity_Observation_PlantTerrestrial,
} from './Activities/Plant/Observations';
import {
  Activity_Observation_Mussels
} from './Activities/Mussels/Observations';
import {
  Activity_Transect_BiocontrolEfficacy,
  Activity_Transect_FireMonitoring,
  Activity_Transect_Vegetation
} from './Activities/Plant/Transects';
import {
  Activity_Treatment_ChemicalPlantAquatic,
  Activity_Treatment_ChemicalPlantTerrestrial,
  Activity_Treatment_MechanicalPlantAquatic,
  Activity_Treatment_MechanicalPlantTerrestrial
} from './Activities/Plant/Treatments';
import { ChemicalTreatment_Species_Codes, Error } from './Components/General_Sub_Forms';
import { AdminDefinedShapeResponse, AdminDefinedShapeResultItem } from './Paths/AdminDefinedShapes';
//Generated with swagger-cli bundle thanks to https://gist.githubusercontent.com/zit0un/3ac0575eb0f3aabdc645c3faad47ab4a/raw/8db5e3ab89418def3a15474979e494c92b69592e/GeoJSON-OAS3.yaml
import { spatialAPISpec } from './util/spatialSchemas';

export const api_doc = {
  openapi: '3.0.0',
  info: {
    version: '0.0.0',
    title: 'invasivesbc-api',
    description: 'API for InvasivesBC',
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
    }
  },
  servers: [
    {
      url: 'http://localhost:3002/api',
      description: 'local api'
    },
    {
      url: 'http://localhost:7080/api',
      description: 'local api via docker'
    },
    {
      url: 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in dev environment'
    },
    {
      url: 'https://api-test-invasivesbci.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in test environment'
    },
    {
      url: 'https://api-invasivesbci.apps.silver.devops.gov.bc.ca',
      description: 'deployed api in prod environment'
    }
  ],
  tags: [
    {
      name: 'misc',
      description: 'Miscellaneous endpoints'
    },
    {
      name: 'activity',
      description:
        "Activity endpointsAn activity is a parent classification that contains Observations, Treatments, and Monitoring 'activities'"
    },
    {
      name: 'observation',
      description: 'Observation activity endpoints'
    },
    {
      name: 'plant',
      description: 'Plant endpoints'
    },
    {
      name: 'code',
      description: 'Code endpoints'
    },
    {
      name: 'media',
      description: 'Media endpoints'
    }
  ],
  externalDocs: {
    description: 'Visit GitHub to find out more about this API',
    url: 'https://github.com/bcgov/lucy-web.git'
  },
  paths: {},
  components: {
    securitySchemes: {
      Bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          "To access the authenticated api routes, a valid JWT token must be present in the 'Authorization' header.The 'Authorization' header value must be of the form: `Bearer xxxxxx.yyyyyyy.zzzzzz`"
      }
    },
    responses: {
      '201': {
        description: 'Created'
      },
      '304': {
        description: 'Not Modified'
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              ...Error
            }
          }
        }
      },
      '401': {
        description: 'Unauthorized user',
        content: {
          'application/json': {
            schema: {
              ...Error
            }
          }
        }
      },
      '409': {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: {
              ...Error
            }
          }
        }
      },
      '503': {
        description: 'Service unavailable',
        content: {
          'application/json': {
            schema: {
              ...Error
            }
          }
        }
      },
      default: {
        description: 'Unexpected error',
        content: {
          'application/json': {
            schema: {
              ...Error
            }
          }
        }
      }
    },
    schemas: {
      ...spatialAPISpec.components.schemas,
      AdminDefinedShapeResultItem,

      AdminDefinedShapeResponse,

      //treatments
      Activity_Treatment_ChemicalPlantTerrestrial: Activity_Treatment_ChemicalPlantTerrestrial,
      Activity_Treatment_ChemicalPlantAquatic: Activity_Treatment_ChemicalPlantAquatic,
      Activity_Treatment_MechanicalPlantTerrestrial: Activity_Treatment_MechanicalPlantTerrestrial,
      Activity_Treatment_MechanicalPlantAquatic: Activity_Treatment_MechanicalPlantAquatic,
      //observations
      Activity_Observation_PlantTerrestrial: Activity_Observation_PlantTerrestrial,
      Activity_Observation_PlantAquatic: Activity_Observation_PlantAquatic,
      Activity_Observation_Mussels: Activity_Observation_Mussels,
      //monitorings
      Activity_Monitoring_ChemicalTerrestrialAquaticPlant: Activity_Monitoring_ChemicalTerrestrialAquaticPlant,
      Activity_Monitoring_MechanicalTerrestrialAquaticPlant: Activity_Monitoring_MechanicalTerrestrialAquaticPlant,
      Activity_Monitoring_BiocontrolRelease_TerrestrialPlant: Activity_Monitoring_BiocontrolRelease_TerrestrialPlant,
      Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant: Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant,
      //biocontrol
      Activity_Biocontrol_Collection: Activity_Biocontrol_Collection,
      Activity_Biocontrol_Release: Activity_Biocontrol_Release,
      //transects
      Activity_Transect_FireMonitoring: Activity_Transect_FireMonitoring,
      Activity_Transect_Vegetation: Activity_Transect_Vegetation,
      Activity_Transect_BiocontrolEfficacy: Activity_Transect_BiocontrolEfficacy,
      //FREP
      Activity_FREP_FormC: Activity_FREP_FormC,
      //other
      ChemicalTreatment_Species_Codes: ChemicalTreatment_Species_Codes
    }
  }
};
