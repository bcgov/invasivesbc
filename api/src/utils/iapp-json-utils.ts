import { SQL, SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import { getSurveysSQL } from '../queries/iapp-queries';
import { getLogger } from './logger';

const defaultLog = getLogger('iapp');

const getIAPPjson = (response: any) => {
  const tempSurveys: any[] = [];
  const tempSpecies: string[] = [];
  var flag = 0;
  // Payload data
  var biogeoclimatic_zone: string = null;
  var site_id: number = null;
  var soil_texture: string = null;
  var site_specific_use: string = null;
  var earliestDate = null;
  var earliestCoords = null;
  var latestDate = null;

  for (const row of response.rows) {
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
    // Get Latest Date
    if (latestDate === null) {
      latestDate = surveyDate;
    } else {
      if (surveyDate.valueOf() > latestDate.valueOf()) {
        latestDate = surveyDate;
      }
    }
    // Initialize payload specific data
    if (flag < 1) {
      biogeoclimatic_zone = row.biogeoclimatic_zone;
      site_id = row.site_id;
      soil_texture = row.soil_texture;
      site_specific_use = row.site_specific_use;
      flag++;
    }

    var survey = {
      genus: null, // Could not see
      density: row.density,
      species: row.invasive_plant, // NEEDS to be converted to plant code
      map_code: null, // Could not see
      survey_id: row.surveyid,
      common_name: row.invasive_plant,
      survey_date: row.site_created_date,
      weeds_found: null, // Could not see (propably do something with density)
      distribution: row.distribution,
      project_code: [], // Could not see
      employer_code: null, // Could not see
      jurisdictions: [
        {
          percent_covered: row.jurisdictions.substring(row.jurisdictions.indexOf(',')),
          jurisdiction_code: row.jurisdictions // Needs to convert to code
        }
      ],
      reported_area: row.estimated_area,
      general_comment: row.survey_comments,
      observation_type: null, // Could not see
      invasive_plant_code: row.invasive_plant, // Needs to convert to code
      observation_type_code: null, // Could not see
      invasive_plant_density_code: row.density.substring(row.density.indexOf('('), row.density.indexOf('(') + 2),
      invasive_species_angency_code: row.survey_agency, // I don't know if this is what this should be, but if it is convert to code
      invasive_plant_distribution_code: row.distribution // Needs to convert to code????
    };
    tempSurveys.push(survey);
  }

  const point_of_interest_payload = {
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
        project_code: [], // Could not find
        general_comment: null, // Could not find
        media_indicator: null, // Could not find
        created_date_on_device: null, // Earliest Date?
        updated_date_on_device: latestDate
      },
      point_of_interest_type_data: {
        slope: null, // Could not find
        aspect: null, // Could not find
        site_id: site_id,
        slope_code: null, // Could not find
        aspect_code: null, // Could not find
        site_elevation: null, // Could not find
        original_bec_id: null, // Could not find
        soil_texture_code: soil_texture, // Needs to convert to code
        specific_use_code: site_specific_use // Needs to convert to code?
      },
      species_negative: [], // Could not find
      species_positive: [], // Could not find
      point_of_interest_type: 'Survey Extract',
      point_of_interest_subtype: null // Could not find
    },
    biogeoclimatic_zones: biogeoclimatic_zone,
    regional_invasive_species_organization_areas: '', // Could not find
    invasive_plant_management_areas: '', // Could not find
    forest_cover_ownership: '', // Could not find
    regional_districts: '', // Could not find
    flnro_districts: '', // Could not find
    moti_districts: '', // Could not find
    media_keys: '', // Could not find
    species_positive: [], // Could not find
    species_negative: [] // Could not find
  };

  return point_of_interest_payload;
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

    const result = getIAPPjson(response);

    return result;
  } catch (error) {
    defaultLog.debug({ label: 'getIAPPjson', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
};
