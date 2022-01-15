import { SQL, SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import { getSurveysSQL } from '../queries/iapp-queries';
import { getLogger } from './logger';

const defaultLog = getLogger('iapp');

const densityMap = {
  '0: Unknown Density': 'X',
  '1: Low (<= 1 plant/m2)': 'L',
  '2: Med (2-5 plants/m2)': 'M',
  '3: High (6-10 plants/m2)': 'H',
  '4: Dense (>10 plants/m2)': 'D'
};

const distributionMap = {
  '0: Unknown distribution': 'NA',
  '1: rare individual / single occurrence': 'RS',
  '2: few sporadically': 'FS',
  '3: single patch or clump': 'CL',
  '4: several sporadically individuals': 'SS',
  '5: a few patches or clumps': 'FP',
  '6: several well-spaced patches / clumps': 'WS',
  '7: continuous / uniform': 'CU',
  '8: continuous with a few gaps': 'CO',
  '9: continuous / dense': 'CD'
};

const getSurveyObj = (row: any) => {
  return {
    genus: null, // Could not see (COME BACK LATER)
    density: row.density,
    species: row.invasive_plant, // NEEDS to be converted to plant code
    map_code: row.map_sheet, // Could not see (Maybe from project code)
    survey_id: row.surveyid,
    common_name: row.invasive_plant,
    survey_date: row.site_created_date,
    weeds_found: row.estimated_area > 0 ? true : false,
    distribution: row.distribution,
    project_code: [
      {
        description: row.survey_paper_file_id
      }
    ],
    employer_code: null, // Could not see
    jurisdictions: [
      {
        percent_covered: row.jurisdictions.substring(row.jurisdictions.indexOf(',')),
        jurisdiction_code: row.jurisdictions // Needs to convert to code
      }
    ],
    reported_area: row.estimated_area,
    general_comment: row.survey_comments,
    observation_type: null, // Could not see (COME BACK LATER)
    invasive_plant_code: row.invasive_plant, // COME BACK TO LATER
    observation_type_code: null, // Could not see (COME BACK TO LATER)
    invasive_plant_density_code: densityMap[row.density],
    invasive_species_agency_code: row.survey_agency, // Come back later
    invasive_plant_distribution_code: distributionMap[row.distribution]
  };
};

const getIAPPjson = (response: any) => {
  const tempSurveys: any[] = [];
  // removed until figure out species p/n: const tempSpecies: string[] = [];
  var flag = 0;
  // Payload data
  var biogeoclimatic_zone: string = null;
  var site_id: number = null;
  var soil_texture: string = null;
  var site_specific_use: string = null;
  var earliestDate = null;
  var earliestCoords = null;
  // removed for now: var latestDate = null;

  for (const row of response.rows) {
    if (flag < 1) {
      biogeoclimatic_zone = row.biogeoclimatic_zone;
      site_id = row.site_id;
      soil_texture = row.soil_texture;
      site_specific_use = row.site_specific_use;
      flag++;
    }

    const surveyDate = row.site_created_date;
    const long = row.decimal_longitude;
    const lat = row.decimal_latitude;
    if (earliestDate === null) {
      earliestDate = surveyDate;
      earliestCoords = [long, lat];
    } else {
      if (surveyDate.valueOf() < earliestDate.valueOf()) {
        earliestDate = surveyDate;
        earliestCoords = [long, lat];
      }
    }

    tempSurveys.push(getSurveyObj(row));
  }

  return {
    point_of_interest_incoming_data_id: null, // COME BACK LATER
    point_of_interest_id: null, // COME BACK LATER
    version: '1.0.0',
    point_of_interest_type: 'IAPP Site',
    point_of_interest_subtype: 'First Load',
    received_timestamp: null, // NOT RELAVENT
    geom: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: earliestCoords
      },
      properties: {}
    },
    point_of_interest_payload: {
      media: [], // Could not see
      geometry: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: earliestCoords
          },
          properties: {}
        }
      ],
      form_data: {
        surveys: tempSurveys,
        chemical_treatments: [],
        biological_dispersals: [],
        biological_treatments: [],
        mechanical_treatments: [],
        point_of_interest_data: {
          date_created: earliestDate,
          project_code: [], // COME BACK TO LATER
          general_comment: null, // Each survey has a comment. Redundant?
          media_indicator: false, // False for now
          created_date_on_device: null, // Nothing for now
          updated_date_on_device: null // Nothing for now
        },
        point_of_interest_type_data: {
          slope: null, // Could not find
          aspect: null, // Could not find
          site_id: site_id,
          slope_code: null, // Could not find slope to find code  (IAPP_Migrator)
          aspect_code: null, // Could not find aspect to find code (IAPP_Migrator)
          site_elevation: null, // Could not find
          original_bec_id: null, // Could not find
          soil_texture_code: soil_texture, // Needs to convert to code
          specific_use_code: site_specific_use // COME BACK LATER site_specific_use is empty
        },
        species_negative: [], // COME BACK LATER
        species_positive: [], // COME BACK LATER
        point_of_interest_type: 'IAPP Site',
        point_of_interest_subtype: 'First Load' // Could not find
      },
      biogeoclimatic_zones: biogeoclimatic_zone,
      regional_invasive_species_organization_areas: '', // COME BACK LATER
      invasive_plant_management_areas: '', // Could not find
      forest_cover_ownership: '', // Could not find
      regional_districts: '', // Could not find
      flnro_districts: '', // Could not find
      moti_districts: '', // Could not find
      media_keys: '', // Could not find
      species_positive: [], // Could not find
      species_negative: [] // Could not find
    }
  };
};

export const getIAPPsurveys = async (siteID: number) => {
  const sanitizedSearchCriteria = new PointOfInterestSearchCriteria({ iappSiteID: 246481 });

  let connection;
  try {
    connection = await getDBConnection();
  } catch (e) {
    console.log('error getting database connection');
    console.log(JSON.stringify(e));
  }

  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }

  try {
    const sqlStatement: SQLStatement = getSurveysSQL(sanitizedSearchCriteria);

    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    return getIAPPjson(response);
  } catch (error) {
    defaultLog.debug({ label: 'getIAPPjson', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
};
