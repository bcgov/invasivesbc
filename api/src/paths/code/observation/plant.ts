import { Operation } from 'express-openapi';
import { PoolClient } from 'pg';
import { ALL_ROLES, CacheKeys } from '../../../constants/misc';
import { getDBConnection } from '../../../database/db';
import {
  getJurisdictionCodesSQL,
  getObservationAspectCodesSQL,
  getObservationGeometryCodesSQL,
  getObservationProposedActionCodesSQL,
  getObservationSlopeCodesSQL,
  getObservationTypeCodesSQL,
  getSoilTextureCodesSQL,
  getSpeciesAgencyCodesSQL,
  getSpeciesCodesSQL,
  getSpeciesDensityCodesSQL,
  getSpeciesDistributionCodesSQL,
  getSpecificUseCodesSQL
} from '../../../queries/code-queries';
import { getLogger } from '../../../utils/logger';
import { cached } from '../../../utils/utils';

const defaultLog = getLogger('observation-controller');

export const GET: Operation = [
  async (req, res, next) => {
    defaultLog.debug({ label: 'code-observation-plant' });

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    const result = await cached(CacheKeys.ObservationCodePlant, 3600000, () =>
      getCodesForPlantObservations(connection)
    )();

    connection.release();

    res.status(200).json(result);
  }
];

GET.apiDoc = {
  description: 'Get all observation plant code values.',
  tags: ['code'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  responses: {
    200: {
      description: 'Code values for a plant observation',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ObservationCodeResponse'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Fetch all code values for plant observations.
 *
 * @param {PoolClient} connection
 * @returns {Promise<object>}
 */
export const getCodesForPlantObservations = async function (connection: PoolClient): Promise<object> {
  if (!connection) {
    return null;
  }

  const result: {
    message: string;
    data: {
      observation_aspect_code: object;
      jurisdiction_code: object;
      observation_geometry_code: object;
      observation_type_code: object;
      observation_proposed_action_code: object;
      observation_slope_code: object;
      soil_texture_code: object;
      species_agency_code: object;
      species_density_code: object;
      species_distribution_code: object;
      species: object;
      specific_use_code: object;
    };
  } = {
    message: 'observation codes',
    data: {
      observation_aspect_code: [],
      jurisdiction_code: [],
      observation_geometry_code: [],
      observation_type_code: [],
      observation_proposed_action_code: [],
      observation_slope_code: [],
      soil_texture_code: [],
      species_agency_code: [],
      species_density_code: [],
      species_distribution_code: [],
      species: [],
      specific_use_code: []
    }
  };

  // Fetch all observation codes
  const observation_aspect_code = await connection.query(getObservationAspectCodesSQL().text);
  const jurisdiction_code = await connection.query(getJurisdictionCodesSQL().text);
  const observation_geometry_code = await connection.query(getObservationGeometryCodesSQL().text);
  const observation_type_code = await connection.query(getObservationTypeCodesSQL().text);
  const observation_proposed_action_code = await connection.query(getObservationProposedActionCodesSQL().text);
  const observation_slope_code = await connection.query(getObservationSlopeCodesSQL().text);
  const soil_texture_code = await connection.query(getSoilTextureCodesSQL().text);
  const species_agency_code = await connection.query(getSpeciesAgencyCodesSQL().text);
  const species_density_code = await connection.query(getSpeciesDensityCodesSQL().text);
  const species_distribution_code = await connection.query(getSpeciesDistributionCodesSQL().text);
  const species = await connection.query(getSpeciesCodesSQL().text);
  const specific_use_code = await connection.query(getSpecificUseCodesSQL().text);

  // Add code responses to results object
  result.data.observation_aspect_code = (observation_aspect_code && observation_aspect_code.rows) || [];
  result.data.jurisdiction_code = (jurisdiction_code && jurisdiction_code.rows) || [];
  result.data.observation_geometry_code = (observation_geometry_code && observation_geometry_code.rows) || [];
  result.data.observation_type_code = (observation_type_code && observation_type_code.rows) || [];
  result.data.observation_proposed_action_code =
    (observation_proposed_action_code && observation_proposed_action_code.rows) || [];
  result.data.observation_slope_code = (observation_slope_code && observation_slope_code.rows) || [];
  result.data.soil_texture_code = (soil_texture_code && soil_texture_code.rows) || [];
  result.data.species_agency_code = (species_agency_code && species_agency_code.rows) || [];
  result.data.species_density_code = (species_density_code && species_density_code.rows) || [];
  result.data.species_distribution_code = (species_distribution_code && species_distribution_code.rows) || [];
  result.data.species = (species && species.rows) || [];
  result.data.specific_use_code = (specific_use_code && specific_use_code.rows) || [];

  return result;
};
