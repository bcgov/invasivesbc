import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch observation aspect codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getObservationAspectCodesSQL = (): SQLStatement => SQL`SELECT * from observation_aspect_code;`;

/**
 * SQL query to fetch jurisdiction codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getJurisdictionCodesSQL = (): SQLStatement => SQL`SELECT * from jurisdiction_code;`;

/**
 * SQL query to fetch observation geometry codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getObservationGeometryCodesSQL = (): SQLStatement => SQL`SELECT * from observation_geometry_code;`;

/**
 * SQL query to fetch observation type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getObservationTypeCodesSQL = (): SQLStatement => SQL`SELECT * from observation_type_code;`;

/**
 * SQL query to fetch observation proposed action codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getObservationProposedActionCodesSQL = (): SQLStatement =>
  SQL`SELECT * from observation_proposed_action_code;`;

/**
 * SQL query to fetch observation slope codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getObservationSlopeCodesSQL = (): SQLStatement => SQL`SELECT * from observation_slope_code;`;

/**
 * SQL query to fetch texture codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getSoilTextureCodesSQL = (): SQLStatement => SQL`SELECT * from soil_texture_code;`;

/**
 * SQL query to fetch agency codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getSpeciesAgencyCodesSQL = (): SQLStatement => SQL`SELECT * from species_agency_code;`;

/**
 * SQL query to fetch density codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getSpeciesDensityCodesSQL = (): SQLStatement => SQL`SELECT * from species_density_code;`;

/**
 * SQL query to fetch distribution codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getSpeciesDistributionCodesSQL = (): SQLStatement => SQL`SELECT * from species_distribution_code;`;

/**
 * SQL query to fetch species codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getSpeciesCodesSQL = (): SQLStatement => SQL`SELECT * from species;`;

/**
 * SQL query to fetch specific use codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getSpecificUseCodesSQL = (): SQLStatement => SQL`SELECT * from specific_use_code;`;
