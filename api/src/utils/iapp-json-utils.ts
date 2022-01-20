import { speciesRefSql } from '../queries/species_ref';
import { SQL, SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import { getIappExtractFromDB, getSitesBasedOnSearchCriteriaSQL } from '../queries/iapp-queries';
import { getLogger } from './logger';
const defaultLog = getLogger('point-of-interest');

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

const mapSlope = (slope) => {
  if (slope === '') return 'NA';
  slope = Number(slope);
  if (!slope) return 'FL';
  if (slope < 5) return 'NF';
  if (slope < 10) return 'GS';
  if (slope < 15) return 'MS';
  if (slope < 20) return 'SS';
  if (slope < 25) return 'VS';
  if (slope < 30) return 'ES';
  if (slope < 45) return 'ST';
  if (slope >= 45) return 'VT';
  return 'NA';
};

const mapAspect = (aspect) => {
  aspect = Number(aspect);
  if ((aspect > 333.5 && aspect <= 360) || aspect <= 22.5) return 'N';
  if (aspect <= 67.5) return 'NE';
  if (aspect <= 112.5) return 'E';
  if (aspect <= 157.5) return 'SE';
  if (aspect <= 202.5) return 'S';
  if (aspect <= 247.5) return 'SW';
  if (aspect <= 292.5) return 'W';
  if (aspect <= 333.5) return 'NW';
  return 'NA';
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

const getSpeciesRef = async () => {
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
    const sqlStatement: SQLStatement = speciesRefSql();

    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    // return getIAPPjson(response);
    // response check:
    // return response;
    return response.rows;
  } catch (error) {
    defaultLog.debug({ label: 'iapp_species_ref', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
};

export const species_and_genus_regex = /[(]([A-Z]{4})[ ]([A-Z]{3})[)]/g;
export const getSpeciesCodesFromIAPPDescriptionList = (input: string, species_ref: Object[]) => {
  const species_and_genus_match_array = [...input.matchAll(species_and_genus_regex)];
  const map_codes_only = species_and_genus_match_array.map((x) => {
    return species_ref.filter((r: any) => {
      if (r.genus === x[1] && r.species === x[2]) return r;
    });
  });
  return map_codes_only.map((r: any) => {
    return r[0].map_symbol;
  });
}; //todo: filter based on species (group 1) and genus (group 0)

const mapSitesRowsToJSON = async (site_extract_table_response: any) => {
  const species_ref: Object[] = await getSpeciesRef();
  const site_ids: [] = site_extract_table_response.rows.map((row) => {
    return parseInt(row['site_id']);
  });

  // get all of them for all the above site ids, vs doing many queries (while looping over sites)
  const all_biological_dispersal_extracts = await getIappExtractFromDB(site_ids, 'biological_dispersal_extract');
  const all_biological_monitoring_extracts = await getIappExtractFromDB(site_ids, 'biological_monitoring_extract');
  const all_biological_treatment_extracts = await getIappExtractFromDB(site_ids, 'biological_treatment_extract');
  const all_chemical_monitoring_extracts = await getIappExtractFromDB(site_ids, 'chemical_monitoring_extract');
  const all_chemical_treatment_extracts = await getIappExtractFromDB(site_ids, 'chemical_treatment_extract');
  const all_mechanical_monitoring_extracts = await getIappExtractFromDB(site_ids, 'mechanical_monitoring_extract');
  const all_mechanical_treatment_extracts = await getIappExtractFromDB(site_ids, 'mechanical_treatment_extract');
  //const all_site_selection_extracts = await getIappExtractFromDB(site_ids, 'site_selection_extract');
  const all_survey_extracts = await getIappExtractFromDB(site_ids, 'survey_extract');

  return site_extract_table_response.rows.map((row) => {
    let iapp_site = getIAPPjson(row);
    (iapp_site as any).species_on_site = getSpeciesCodesFromIAPPDescriptionList(
      row['all_species_on_site'],
      species_ref
    );
    const relevant_biological_dispersal_extracts = all_biological_dispersal_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_biological_monitoring_extracts = all_biological_monitoring_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_biological_treatment_extracts = all_biological_treatment_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_chemical_monitoring_extracts = all_chemical_monitoring_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_chemical_treatment_extracts = all_chemical_treatment_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_mechanical_monitoring_extracts = all_mechanical_monitoring_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_mechanical_treatment_extracts = all_mechanical_treatment_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    const relevant_survey_extracts = all_survey_extracts.filter((r) => {
      return r.site_id === row.site_id;
    });
    (iapp_site as any).surveys = relevant_survey_extracts.map((x) => {
      return getSurveyObj(x);
    });

    return iapp_site;
  });
};

const getIAPPjson = (row: Object) => {
  try {
    return {
      point_of_interest_id: row['site_id'],
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
        media: [], // Could not see
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
            //date_created: earliestDate,
            project_code: [], // COME BACK TO LATER
            general_comment: null, // Each survey has a comment. Redundant?
            media_indicator: false, // False for now
            created_date_on_device: null, // Nothing for now
            updated_date_on_device: null // Nothing for now
          },
          point_of_interest_type_data: {
            slope: row['slope'], // site_selection_extract
            aspect: row['aspect'], // Could not find
            site_id: row['site_id'],
            slope_code: mapSlope(row['slope']), // Could not find slope to find code  (IAPP_Migrator)
            aspect_code: mapAspect(row['aspect']), // Could not find aspect to find code (IAPP_Migrator)
            site_elevation: row['elevation'], // Could not find
            original_bec_id: null, // Could not find
            soil_texture_code: row['soil_texture'] // Needs to convert to code
            //specific_use_code: site_specific_use // COME BACK LATER site_specific_use is empty
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
    const sqlStatement: SQLStatement = getSitesBasedOnSearchCriteriaSQL(searchCriteria);

    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    const returnVal = await mapSitesRowsToJSON(response);

    return {
      rows: returnVal,
      count: returnVal.length
    };
  } catch (error) {
    defaultLog.debug({ label: 'getIAPPjson', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
};
