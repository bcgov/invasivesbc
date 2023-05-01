import { speciesRefSql } from '../queries/species_ref';
import { SQL, SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import { getIappExtractFromDB, getSitesBasedOnSearchCriteriaSQL } from '../queries/iapp-queries';
import { getLogger } from './logger';
import { densityMap, distributionMap, mapAspect, mapSlope } from './iapp-payload/iapp-function-utils';
import {
  biologicalTreatmentsJSON,
  biologicalDispersalJSON,
  chemicalTreatmentJSON,
  mechanicalTreatmenntsJSON
} from './iapp-payload/extracts-json-utils';
import { mapSitesRowsToCSV } from './iapp-csv-utils';

const defaultLog = getLogger('point-of-interest');

const getSurveyObj = (row: any, map_code: any) => {
  const leftBracket = row.invasive_plant.indexOf('(');
  const common_name = row.invasive_plant.substring(0, leftBracket - 1);
  const plant_code = row.invasive_plant.substring(leftBracket + 6, row.invasive_plant.length - 1);
  const genus = row.invasive_plant.substring(leftBracket + 1, leftBracket + 5);
  const tempJurisdictions = row.jurisdictions.split('),');

  const formatJurisdictions = (arr: any[]) => {
    const tempArr = [];

    arr.forEach((item) => {
      const leftItemBracket = item.indexOf('(');
      const percent = item.indexOf('%');

      tempArr.push({
        jurisdiction_code: item.substring(0, leftItemBracket - 1),
        percent_covered: item.substring(leftItemBracket + 1, percent)
      });
    });

    return tempArr;
  };

  const jurisdictions = formatJurisdictions(tempJurisdictions);

  return {
    genus: genus, // (XXXX)
    density: row.density,
    species: row.invasive_plant, // NEEDS to be converted to plant code
    map_code: map_code, // Could not see (Maybe from project code)
    survey_id: row.surveyid,
    common_name: common_name,
    surveyor_name: row.primary_surveyor,
    other_surveyors: row.other_surveyors,
    survey_paper_file_id: row.survey_paper_file_id,
    survey_date: row.survey_date,
    weeds_found: row.estimated_area > 0 ? true : false,
    distribution: row.distribution,
    project_code: [
      {
        description: row.survey_paper_file_id
      }
    ],
    employer_code: null, // Could not see
    jurisdictions: jurisdictions,
    reported_area: row.estimated_area_hectares,
    general_comment: row.survey_comments,
    observation_type: null, // Could not see (COME BACK LATER)
    invasive_plant_code: plant_code, // COME BACK TO LATER
    observation_type_code: null, // Could not see (COME BACK TO LATER)
    invasive_plant_density_code: densityMap[row.density],
    invasive_species_agency_code: row.survey_agency, // Come back later
    employer: row.employer,
    survey_type: row.survey_type,
    invasive_plant_distribution_code: distributionMap[row.distribution],
    entered_by: row.entered_by,
    date_entered: row.date_entered,
    updated_by: row.updated_by,
    date_updated: row.date_updated
  };
};

export const getSpeciesRef = async () => {
  let connection;
  try {
    connection = await getDBConnection();
  } catch (e) {
    throw {
      message: 'Error connecting to database',
      code: 500,
      namespace: 'iapp-json-utils'
    };
  }

  if (!connection) {
    throw {
      code: 503,
      message: 'Failed to establish database connection',
      namespace: 'iapp-json-utils'
    };
  }

  try {
    const sqlStatement: SQLStatement = speciesRefSql();

    if (!sqlStatement) {
      throw {
        code: 400,
        message: 'Failed to build SQL statement',
        namespace: 'iapp-json-utils'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    return response.rows;
  } catch (error) {
    defaultLog.debug({ label: 'iapp_species_ref', message: 'error', error });
    throw {
      code: 500,
      message: 'Failed to get species ref',
      namespace: 'iapp-json-utils'
    };
  } finally {
    connection.release();
  }
};

export const species_and_genus_regex = /[(]([A-Z]{4})[ ]([A-Z]{3})[)]/g;
export const getSpeciesCodesFromIAPPDescriptionList = (input: string, species_ref: any[]) => {
  const species_and_genus_match_array = [...input?.matchAll(species_and_genus_regex)];
  const map_codes_only = species_and_genus_match_array.map((x) => {
    return species_ref?.filter((r: any) => {
      if (r.genus === x[1] && r.species === x[2]) return r;
    });
  });
  return map_codes_only.map((r: any) => {
    return r[0]?.map_symbol;
  });
}; //todo: filter based on species (group 1) and genus (group 0)

const mapSitesRowsToJSON = async (site_extract_table_response: any, searchCriteria: any) => {
  const species_ref: any[] = await getSpeciesRef();
  defaultLog.debug({ label: 'getIAPPjson', message: 'about to map over sites to grab site_id' });
  const site_ids: [] = site_extract_table_response.rows.map((row) => {
    return parseInt(row['site_id']);
  });
  defaultLog.debug({ label: 'getIAPPjson', message: 'site ids', site_ids });

  // get all of them for all the above site ids, vs doing many queries (while looping over sites)
  let all_site_selection_extracts = [];
  let all_biological_dispersal_extracts = [];
  let all_biological_monitoring_extracts = [];
  let all_biological_treatment_extracts = [];
  let all_chemical_monitoring_extracts = [];
  let all_chemical_treatment_extracts = [];
  let all_mechanical_monitoring_extracts = [];
  let all_mechanical_treatment_extracts = [];
  let all_survey_extracts = [];

  if (!searchCriteria.site_id_only) {
    // get all of them for all the above site ids, vs doing many queries (while looping over sites)
    all_site_selection_extracts = await getIappExtractFromDB(site_ids, 'site_selection_extract');
    all_biological_dispersal_extracts = await getIappExtractFromDB(site_ids, 'biological_dispersal_extract');
    all_biological_monitoring_extracts = await getIappExtractFromDB(site_ids, 'biological_monitoring_extract');
    all_biological_treatment_extracts = await getIappExtractFromDB(site_ids, 'biological_treatment_extract');
    all_chemical_monitoring_extracts = await getIappExtractFromDB(site_ids, 'chemical_monitoring_extract');
    all_chemical_treatment_extracts = await getIappExtractFromDB(site_ids, 'chemical_treatment_extract');
    all_mechanical_monitoring_extracts = await getIappExtractFromDB(site_ids, 'mechanical_monitoring_extract');
    all_mechanical_treatment_extracts = await getIappExtractFromDB(site_ids, 'mechanical_treatment_extract');
    all_survey_extracts = await getIappExtractFromDB(site_ids, 'survey_extract');
  }

  defaultLog.debug({ label: 'getIAPPjson', message: 'about to map over sites' });
  return site_extract_table_response.rows.map((row) => {
    // Fetching site selection extract
    const relevant_site_selection_extracts = all_site_selection_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    // Setting iapp site object
    const iapp_site = getIAPPjson(row, relevant_site_selection_extracts[0], searchCriteria);
    if (searchCriteria.site_id_only) {
      return iapp_site;
    }
    defaultLog.debug({
      label: 'getIAPPjson',
      message: 'getting species codes'
    });
    (iapp_site as any).species_on_site = getSpeciesCodesFromIAPPDescriptionList(
      row['all_species_on_site'],
      species_ref
    );
    // Fetching Extracts
    const relevant_biological_dispersal_extracts = all_biological_dispersal_extracts?.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_biological_monitoring_extracts = all_biological_monitoring_extracts?.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_biological_treatment_extracts = all_biological_treatment_extracts?.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_chemical_monitoring_extracts = all_chemical_monitoring_extracts?.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_chemical_treatment_extracts = all_chemical_treatment_extracts?.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_mechanical_monitoring_extracts = all_mechanical_monitoring_extracts?.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_mechanical_treatment_extracts = all_mechanical_treatment_extracts?.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_survey_extracts = all_survey_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    // Assigning extracts into form_data
    (iapp_site as any).point_of_interest_payload.form_data.surveys = relevant_survey_extracts?.map((x) => {
      const returnVal = getSurveyObj(x, row['map_symbol']);
      if (returnVal) return returnVal;
      else return [];
    });
    (iapp_site as any).point_of_interest_payload.form_data.biological_treatments = relevant_biological_treatment_extracts.map(
      (x) => {
        const returnVal = biologicalTreatmentsJSON(x, relevant_biological_monitoring_extracts);
        if (returnVal) return returnVal;
        else return [];
      }
    );
    (iapp_site as any).point_of_interest_payload.form_data.biological_dispersals = relevant_biological_dispersal_extracts.map(
      (x) => {
        const returnVal = biologicalDispersalJSON(x);
        if (returnVal) return returnVal;
        else return [];
      }
    );
    (iapp_site as any).point_of_interest_payload.form_data.chemical_treatments = relevant_chemical_treatment_extracts.map(
      (x) => {
        const returnVal = chemicalTreatmentJSON(x, relevant_chemical_monitoring_extracts);
        if (returnVal) return returnVal;
        else return [];
      }
    );
    (iapp_site as any).point_of_interest_payload.form_data.mechanical_treatments = relevant_mechanical_treatment_extracts.map(
      (x) => {
        const returnVal = mechanicalTreatmenntsJSON(x, relevant_mechanical_monitoring_extracts);
        if (returnVal) return returnVal;
        else return [];
      }
    );

    // monitored flag
    const monitored =
      row['has_biological_treatment_monitorings'] ||
      row['has_chemical_treatment_monitorings'] ||
      row['has_mechanical_treatment_monitorings']
        ? 'Yes'
        : 'No';

    (iapp_site as any).point_of_interest_payload.form_data.monitored = monitored;

    return iapp_site;
  });
};

const getIAPPjson = (row: any, extract: any, searchCriteria: any) => {
  try {
    if (searchCriteria.site_id_only) {
      return {
        point_of_interest_id: row['site_id'],
        site_id: row['site_id']
      };
    }
    return {
      point_of_interest_id: row['site_id'],
      site_id: row['site_id'],
      version: '1.0.0',
      point_of_interest_type: 'IAPP Site',
      point_of_interest_subtype: 'First Load',
      received_timestamp: null, // NOT RELAVENT
      geom: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(row['decimal_longitude']), parseFloat(row['decimal_latitude'])]
        },
        properties: {}
      },
      point_of_interest_payload: {
        media: [],
        importedMedia: row['imported_images'],
        geometry: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [parseFloat(row['decimal_longitude']), parseFloat(row['decimal_latitude'])]
            },
            properties: {}
          }
        ],
        form_data: {
          point_of_interest_data: {
            date_created: extract.site_created_date,
            project_code: [
              {
                description: extract.site_paper_file_id
              }
            ],
            general_comment: extract.site_comments,
            map_sheet: extract.mapsheet,
            media_indicator: false, // False for now
            created_date_on_device: null, // Nothing for now
            updated_date_on_device: null // Nothing for now
          },
          point_of_interest_type_data: {
            utm_zone: extract.utm_zone,
            utm_northing: extract.utm_northing,
            utm_easting: extract.utm_easting,
            range_unit_id: extract.range_unit_id,
            slope: extract.slope,
            aspect: extract.aspect,
            site_id: row['site_id'],
            slope_code: mapSlope(extract.slope),
            aspect_code: extract.aspect,
            site_elevation: extract.elevation,
            original_bec_id: null, // Could not find
            soil_texture_code: extract.soil_texture,
            specific_use_code: extract.site_specific_use,
            access_description: extract.site_location,
            entered_by: extract.entered_by,
            date_entered: extract.date_entered,
            updated_by: extract.updated_by,
            date_updated: extract.date_updated
          },
          species_negative: [], // COME BACK LATER
          species_positive: [], // COME BACK LATER
          point_of_interest_type: 'IAPP Site',
          point_of_interest_subtype: 'First Load' // Could not find
        },
        biogeoclimatic_zones: row['biogeoclimatic_zone'],
        regional_invasive_species_organization_areas: '', // COME BACK LATER
        invasive_plant_management_areas: '', // Could not find
        forest_cover_ownership: '', // Could not find
        regional_districts: '', // Could not find
        flnro_districts: '', // Could not find
        moti_districts: '', // Could not find
        media_keys: '', // Could not find
        jurisdictions: row.jurisdictions,
        date_created: row.min_survey,
        date_last_surveyed: row.max_survey,
        species_positive: [], // Could not find
        species_negative: [] // Could not find
      }
    };
  } catch (e) {
    throw 'error mapping iapp site to point of interest (at site level)';
  }
};

export const getIAPPsites = async (searchCriteria: any) => {
  let connection;
  try {
    connection = await getDBConnection();
  } catch (e) {
    throw {
      message: 'Error connecting to database',
      code: 500,
      namespace: 'iapp-json-utils'
    };
  }

  if (!connection) {
    throw {
      code: 503,
      message: 'Failed to establish database connection',
      namespace: 'iapp-json-utils'
    };
  }

  try {
    const sqlStatement: SQLStatement = getSitesBasedOnSearchCriteriaSQL(searchCriteria);

    if (!sqlStatement) {
      throw {
        code: 400,
        message: 'Failed to build SQL statement',
        namespace: 'iapp-json-utils'
      };
    }

    defaultLog.debug({ label: 'getIAPPjson', message: 'about to query for sites' });
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    defaultLog.debug({ label: 'getIAPPjson', message: 'queried for sites' + response.rowCount });

    if (searchCriteria.isCSV && searchCriteria.CSVType === 'site_selection_extract') {
      var returnVal1 = response.rowCount > 0 ? await mapSitesRowsToCSV(response, 'site_selection_extract') : [];
      return returnVal1;
    } else {
      var returnVal2 = response.rowCount > 0 ? await mapSitesRowsToJSON(response, searchCriteria) : [];

      return {
        rows: returnVal2,
        count: returnVal2.length
      };
    }
  } catch (error) {
    defaultLog.debug({ label: 'getIAPPjson', message: 'error', error });
    throw {
      code: 500,
      message: 'Failed to get IAPP sites',
      namespace: 'iapp-json-utils'
    };
  } finally {
    connection.release();
  }
};
