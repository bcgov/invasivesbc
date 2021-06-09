import fs from 'fs';
import { AxiosRequestConfig } from 'axios';
import csv from 'csvtojson';
import axios from 'axios';
import qs from 'qs';
import moment from 'moment';
import meow from 'meow';

// HELPER FUNCTIONS (TODO move somewhere more general):

const formatDateToISO = (dateString: string) => {
  const supportedFormats = ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD/MM/YYYY', 'DD-MM-YYYY'];
  if (!dateString) return;
  return moment(dateString, supportedFormats).format('YYYY-MM-DD');
};

// return items matching field value in an array of objects sorted by field
// https://www.w3resource.com/javascript-exercises/javascript-array-exercise-18.php
const binarySearchValues = (items, field, value) => {
  if (!items?.length) return [];
  let firstIndex = 0;
  let lastIndex = items.length - 1;
  let middleIndex = Math.floor((lastIndex + firstIndex) / 2);

  while (items[middleIndex][field] !== value && firstIndex < lastIndex) {
    if (value < items[middleIndex][field]) {
      lastIndex = Math.max(middleIndex - 1, 0);
    } else if (value > items[middleIndex][field]) {
      firstIndex = Math.min(middleIndex + 1, items.length - 1);
    }
    middleIndex = Math.floor((lastIndex + firstIndex) / 2);
  }

  if (items[middleIndex][field] !== value) return [];

  // get multiple matches:
  firstIndex = lastIndex = middleIndex;
  while (firstIndex > 0 && items[firstIndex - 1][field] === value) firstIndex = firstIndex - 1;
  while (lastIndex < items.length - 1 && items[lastIndex + 1][field] === value) lastIndex = lastIndex + 1;

  return items.slice(firstIndex, lastIndex + 1);
};

// helper to get common values of an array of objects
// returns fallback value if empty or no common value
const getCommonValue = (array, fallback = undefined) => (new Set(array).size === 1 ? array[0] : fallback);

const hectaresToM2 = (hectares) => Math.round(Number(hectares) * 10000) | 0;

const mapYN = (value) => {
  switch(value) {
    case 'Y': return 'Yes';
    case 'N': return 'No';
    default: return 'Unknown';
  }
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

const mapEfficacyCode = (percent) => {
  percent = Number(percent);
  if (percent < 10) return 10;
  if (percent < 20) return 9;
  if (percent < 30) return 8;
  if (percent < 40) return 7;
  if (percent < 50) return 6;
  if (percent < 60) return 5;
  if (percent < 70) return 4;
  if (percent < 80) return 3;
  if (percent < 90) return 2;
  if (percent <= 100) return 1;
  return;
};

const mapBioAgentStageCode = (t) => {
  let count = 0;
  let ret = 'NA';
  if (t.STAGE_LARVA_IND) {
    count += 1;
    ret = 'LA';
  }
  if (t.STAGE_PUPA_IND) {
    count += 1;
    ret = 'PU';
  }
  if (t.STAGE_EGG_IND) {
    count += 1;
    ret = 'EG';
  }
  if (t.STAGE_OTHER_IND) {
    count += 1;
    ret = 'OT';
  }
  if (count > 1)
    return 'AL';
  return ret;
};

// LOOKUP TABLES:

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

const observationTypes = {
  'C: Cursory': 'CU',
  'O: Operational': 'OP',
  'P: Precise': 'PR'
  // add more as they show up in CSV
};

const mechMethodCodes = {
  Digging: 'DIG',
  Bury: 'BRY',
  'Controlled Burning': 'BUR',
  'Cultivation or till': 'CUL',
  'Dead-heading': 'DED',
  'Flaming / burn': 'FLA',
  'Flaming / Tiger Torch burn': 'FLA',
  'Hand pulling': 'HAN',
  'Hot water / Steam': 'HWS',
  Mowing: 'MOW',
  Mulching: 'MUL',
  'Suction dredging': 'SD',
  'Sheet Mulching': 'SHM',
  'Salt water / Vinegar': 'SV',
  'Targeted grazing': 'TG',
  Tarping: 'TR',
  Seeding: 'SED',
  Planting: 'PLT',
  Legacy: 'CNV', // Note, may want to treat this differently
  'Mechanical Method not recorded': 'CNV'
};

const chemMethodCodes = {
  ATV: 'ATV',
  'Basal Bark': 'BBA',
  'Boomless Nozzle': 'BNO',
  'Back Pack': 'BPA',
  'Cut and Insert': 'CIN',
  'Cut Stump / Cut and Paint': 'CSP',
  'Cut Stump / Paint': 'CSP',
  'Fixed Boom': 'FBO',
  'Hand Gun': 'HGU',
  'Chemical Method not recorded': 'NOT',
  'Stem Injection': 'SIN',
  Spread: 'SPR',
  Wick: 'WCK'
};

// IMPORT LOGIC:

const cli = meow(
  /*
    Usage
      $ IAPP_Migrate [[OPTION] [FILENAME] [OPTION] [FILENAME]...] ENDPOINT

    Options
      --site fileName, -si fileName
      --survey fileName, -su fileName
      --mechanicalTreatment fileName, -mt fileName
      --mechanicalMonitoring fileName, -mm fileName
      --chemicalTreatment fileName, -ct fileName
      --chemicalMonitoring fileName, -cm fileName
      --dispersal fileName, -d fileName
      --bioControlOutput fileName, -b fileName

    Examples
      Load just sites:
      $ IAPP_Migrate --site sites.csv http://point_of_interest_endpoint/
      Load more:
      $ IAPP_Migrate --si sites.csv -su surveys.csv --mt mechtreatments.csv --mm mechmonitoring.csv --ct chemtreatments.csv --cm chemmonitoring.csv http://point_of_interest_endpoint

    Recommend ts-node for Windows users.  Command is then:
    $ ts-node IAPP_Migrator.ts --site sites.csv http://point_of_interest_endpoint/

    REQUIREMENTS:
      CSV files must be sorted according to:
      --site: SiteID DESC
      --survey: SiteID ASC
      --mechanicalTreatment: SiteID ASC
      --mechanicalMonitoring: treatment_id ASC
      --chemicalTreatment: SiteID ASC
      --chemicalMonitoring: treatment_id ASC
      --biologicalTreatment: site_id ASC
      --biologicalMonitoring: treatment_id ASC
      --dispersal: SiteID ASC
      --bioControlOutput: SiteID ASC

    OUTPUT:
      Data will be sorted according to:
      --site: SiteID DESC
      --survey: SurveyID DESC
      --mechanicalTreatment: TreatmentID DESC
      --mechanicalMonitoring: monitoring_id DESC
      --chemicalTreatment: TreatmentID DESC
      --chemicalMonitoring: monitoring_id DESC
      --biologicalTreatment: biological_id DESC
      --biologicalMonitoring: monitoring_id DESC
      --dispersal: biological_dispersal_id DESC
      --bioControlOutput: SiteID DESC
  */
  {
    flags: {
      site: {
        type: 'string',
        alias: 'si',
        isRequired: true
      },
      survey: {
        type: 'string',
        alias: 'su',
        isRequired: false
      },
      mechanicalTreatment: {
        type: 'string',
        alias: 'mt',
        isRequired: false
      },
      mechanicalMonitoring: {
        type: 'string',
        alias: 'mm',
        isRequired: false
      },
      chemicalTreatment: {
        type: 'string',
        alias: 'ct',
        isRequired: false
      },
      chemicalMonitoring: {
        type: 'string',
        alias: 'cm',
        isRequired: false
      },
      biologicalTreatment: {
        type: 'string',
        alias: 'bt',
        isRequired: false
      },
      biologicalMonitoring: {
        type: 'string',
        alias: 'bm',
        isRequired: false
      },
      dispersal: {
        type: 'string',
        alias: 'd',
        isRequired: false
      },
      bioControlOutput: {
        type: 'string',
        alias: 'b',
        isRequired: false
      }
    }
  }
);
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

const getToken = () => {
  const tokenPostData = qs.stringify({
    username: 'postman',
    password: 'postman_password',
    scope: 'openid',
    client_id: 'invasives-bc',
    grant_type: 'password'
  });

  return axios({
    method: 'post',
    url: 'https://dev.oidc.gov.bc.ca/auth/realms/dfmlcg7z/protocol/openid-connect/token',
    data: tokenPostData,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
  });
};

const loadACSV = async (fileName: string) => {
  return new Promise<any[]>((resolve, reject) => {
    const results = [];
    fs.createReadStream(fileName)
      .pipe(csv({ trim: true }))
      .on('data', (data) => {
        results.push(JSON.parse(data.toString('utf8')));
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error); // or return null, or throw an error, or w/e makes sense here
      });
  });
};

interface IAPPDataInterface {
  siteData?: any[];
  surveyData?: any[];
  mechanicalTreatmentData?: any[];
  mechanicalMonitoringData?: any[];
  chemicalTreatmentData?: any[];
  chemicalMonitoringData?: any[];
  biologicalTreatmentData?: any[];
  biologicalMonitoringData?: any[];
  dispersalData?: any[];
  bioControlOutputData?: any[];
}

const loadAllData = async () => {
  const results: IAPPDataInterface = {};

  if (!cli.flags.site) {
    return;
  }
  console.log('Loading sites...');
  results.siteData = await loadACSV(cli.flags.site);
  console.log(results.siteData.length + ' sites loaded.');

  if (cli.flags.survey) {
    console.log('Loading surveys...');
    results.surveyData = await loadACSV(cli.flags.survey);
    console.log(results.surveyData.length + ' surveys loaded.');
  }

  if (cli.flags.mechanicalTreatment) {
    console.log('Loading mechanical treatments...');
    results.mechanicalTreatmentData = await loadACSV(cli.flags.mechanicalTreatment);
    console.log(results.mechanicalTreatmentData.length + ' mech treatments loaded.');
  }

  if (cli.flags.mechanicalMonitoring) {
    console.log('Loading mechanical monitoring...');
    results.mechanicalMonitoringData = await loadACSV(cli.flags.mechanicalMonitoring);
    console.log(results.mechanicalMonitoringData.length + ' mech monitoring records loaded.');
  }

  if (cli.flags.chemicalTreatment) {
    console.log('Loading chemical treatments...');
    results.chemicalTreatmentData = await loadACSV(cli.flags.chemicalTreatment);
    console.log(results.chemicalTreatmentData.length + ' chem treatments loaded.');
  }

  if (cli.flags.chemicalMonitoring) {
    console.log('Loading chemical monitoring...');
    results.chemicalMonitoringData = await loadACSV(cli.flags.chemicalMonitoring);
    console.log(results.chemicalMonitoringData.length + ' chem monitoring records loaded.');
  }

  if (cli.flags.biologicalTreatment) {
    console.log('Loading bio treatments...');
    results.biologicalTreatmentData = await loadACSV(cli.flags.biologicalTreatment);
    console.log(results.biologicalTreatmentData.length + ' bio treatments loaded.');
  }

  if (cli.flags.biologicalMonitoring) {
    console.log('Loading bio monitoring...');
    results.biologicalMonitoringData = await loadACSV(cli.flags.biologicalMonitoring);
    console.log(results.biologicalMonitoringData.length + ' bio monitoring records loaded.');
  }

  if (cli.flags.dispersal) {
    console.log('Loading dispersals...');
    results.dispersalData = await loadACSV(cli.flags.dispersal);
    console.log(results.dispersalData.length + ' dispersal records loaded.');
  }

  if (cli.flags.bioControlOutput) {
    console.log('Loading bio control outputs...');
    results.bioControlOutputData = await loadACSV(cli.flags.bioControlOutput);
    console.log(results.bioControlOutputData.length + ' bio control output records loaded.');
  }

  return results;
};

//const urlstring = 'http://localhost:7080/api/point-of-interest';
const urlstring = 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca/api/point-of-interest';

const main = async () => {
  const IAPPData = await loadAllData();

  let siteCount = 0;
  const batchSize = 1000;

  // assumes site CSV sorted by SiteID DESC
  while (siteCount < IAPPData.siteData.length) {
    let batch = 0;
    const pois: Array<object> = [];

    while (batch < batchSize) {
      const siteRecord = IAPPData.siteData[siteCount];
      if (!IAPPData.siteData[siteCount]) break;
      const siteRecordID = siteRecord['SiteID'];

      // assumes surveys CSV sorted by SiteID ASC
      const surveys = binarySearchValues(IAPPData.surveyData, 'SiteID', siteRecordID);
      // restore desired sorting order by SurveyID DESC (latest first)
      surveys.sort((a, b) => Number(b.SurveyID) - Number(a.SurveyID));

      // assumes mechtreatements CSV sorted by SiteID ASC
      let mechanical_treatments = binarySearchValues(IAPPData.mechanicalTreatmentData, 'SiteID', siteRecordID);
      mechanical_treatments = mechanical_treatments.map((treatment) => {
        // assumes monitoring CSV sorted by treatment_id ASC
        treatment.monitoring = binarySearchValues(
          IAPPData.mechanicalMonitoringData,
          'treatment_id',
          treatment.TreatmentID
        );
        // restore desired sorting order by monitoring_id DESC (latest first)
        treatment.monitoring.sort((a, b) => Number(b.monitoring_id) - Number(a.monitoring_id));
        return treatment;
      });
      // restore desired sorting order by TreatmentID DESC (latest first)
      mechanical_treatments.sort((a, b) => Number(b.TreatmentID) - Number(a.TreatmentID));

      // assumes chemtreatements CSV sorted by SiteID ASC
      let chemical_treatments = binarySearchValues(IAPPData.chemicalTreatmentData, 'SiteID', siteRecordID);
      chemical_treatments = chemical_treatments.map((treatment) => {
        // assumes monitoring CSV sorted by TreatmentID ASC
        treatment.monitoring = binarySearchValues(
          IAPPData.chemicalMonitoringData,
          'treatment_id',
          treatment.TreatmentID
        );
        // restore desired sorting order by monitoring_id DESC (latest first)
        treatment.monitoring.sort((a, b) => Number(b.monitoring_id) - Number(a.monitoring_id));
        return treatment;
      });
      // restore desired sorting order by TreatmentID DESC (latest first)
      chemical_treatments.sort((a, b) => Number(b.TreatmentID) - Number(a.TreatmentID));

      // assumes biotreatments CSV sorted by site_id ASC
      let biological_treatments = binarySearchValues(IAPPData.biologicalTreatmentData, 'site_id', siteRecordID);
      biological_treatments = biological_treatments.map((treatment) => {
        // assumes monitoring CSV sorted by treatment_id ASC
        treatment.monitoring = binarySearchValues(
          IAPPData.biologicalMonitoringData,
          'treatment_id',
          treatment.treatment_id
        );
        // restore desired sorting order by monitoring_id DESC (latest first)
        treatment.monitoring.sort((a, b) => Number(b.monitoring_id) - Number(a.monitoring_id));
        return treatment;
      });
      // restore desired sorting order by biological_id DESC (latest first)
      biological_treatments.sort((a, b) => Number(b.biological_id) - Number(a.biological_id));

      // assumes dispersals CSV sorted by site_id ASC
      const biological_dispersals = binarySearchValues(IAPPData.dispersalData, 'site_id', siteRecordID);
      // restore desired sorting order by biological_dispersal_id ASC
      biological_dispersals.sort((a, b) => Number(a.biological_dispersal_id) - Number(b.biological_dispersal_id));

      siteCount++;

      // Go/No-Go Rules:
      // only import POIs which have Survey data:
      if (!surveys?.length) continue;

      const surveyAgencyCodes = surveys.map((survey) => survey.SurveyAgency).filter((agency) => agency);
      const surveySpecies = surveys.map((survey) => survey.Species).filter((agency) => agency);

      const requestBody: any = {
        point_of_interest_type: 'IAPP Site',
        point_of_interest_subtype: 'First Load',
        media: [],
        geometry: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [+siteRecord.OFF_Longitude, +siteRecord.OFF_Latitude]
            },
            properties: {}
          }
        ],
        form_data: {
          point_of_interest_data: {
            invasive_species_agency_code: getCommonValue(surveyAgencyCodes, undefined),
            jurisdiction_code: Number(siteRecord.Jur1pct) === 100 ? siteRecord.Jur1 : undefined,
            // point_of_interest_status: 'done',
            general_comment: siteRecord.Comments,
            access_description: siteRecord.AccessDescription,
            media_indicator: false,
            created_date_on_device: formatDateToISO(siteRecord.CreateDate),
            updated_date_on_device: formatDateToISO(siteRecord.CreateDate),
            project_code: [
              {
                description: siteRecord.PaperFile
              }
            ]
          },

          point_of_interest_type_data: {
            site_id: siteRecordID,
            original_bec_id: siteRecord.BEC_ID,
            map_sheet: siteRecord.MapSheet,
            soil_texture_code: siteRecord.SoilTexture || 'X',
            specific_use_code: siteRecord.SpecificUse || 'X', // note: these dont map to our code table correctly - something is wrong
            slope_code: mapSlope(siteRecord.Slope),
            slope: siteRecord.Slope,
            aspect_code: mapAspect(siteRecord.Aspect),
            aspect: siteRecord.Aspect,
            site_elevation: siteRecord.Elevation,
            species: surveySpecies
          },

          surveys: surveys.map((survey) => ({
            survey_id: survey.SurveyID,
            survey_date: formatDateToISO(survey.SurveyDate),
            reported_area: hectaresToM2(survey.EstArea), // hectares to m2
            map_code: survey.MapCode,
            invasive_species_agency_code: survey.SurveyAgency,
            // invasive_plant_code: 'NA', // TODO map common/species/genus to plant code
            invasive_plant_code: survey.Species,
            common_name: survey.CommonName, // redundant? ^
            species: survey.Species, // redundant ^
            genus: survey.Genus, // redundant? ^
            invasive_plant_density_code: densityMap[survey.Density],
            density: survey.Density, // redundant ^
            invasive_plant_distribution_code: distributionMap[survey.Distribution],
            distribution: survey.Distribution,  // redundant ^
            // proposed_treatment_code
            observation_type_code: observationTypes[survey.SurveyType],
            observation_type: survey.SurveyType,  // redundant ^
            general_comment: survey.Comment,
            project_code: [
              {
                description: survey.PaperFileID
              }
            ],
            weeds_found: survey.WeedsFound,
            employer_code: survey.EmployerCode ? survey.EmployerCode : undefined,
            jurisdictions: [
              {
                jurisdiction_code: survey.Jur1,
                percent_covered: survey.Jur1pct
              },
              {
                jurisdiction_code: survey.Jur2,
                percent_covered: survey.Jur2pct
              },
              {
                jurisdiction_code: survey.Jur3,
                percent_covered: survey.Jur3pct
              }
            ].filter((jur) => jur.jurisdiction_code && jur.percent_covered && Number(jur.percent_covered) > 0)
          })),

          mechanical_treatments: mechanical_treatments.map((t) => ({
            // General treatment properties:
            treatment_id: t.TreatmentID,
            treatment_date: formatDateToISO(t.TreatmentDate),
            map_code: t.MapCode,
            reported_area: hectaresToM2(t.AreaTreated),
            // invasive_plant_code: 'NA', // TODO map common_name to plant code
            common_name: t.CommonName,
            invasive_species_agency_code: t.TreatmentAgency,
            employer: t.Employer,
            project_code: [
              {
                description: t.PaperFileID
              }
            ],
            general_comment: t.Comment,

            // Mech-Specific properties:
            mechanical_id: t.MechanicalID,
            mechanical_method_code: mechMethodCodes[t.MechanicalMethod],
            mechanical_method: t.MechanicalMethod,

            monitoring: t.monitoring.map((m) => ({
              monitoring_id: m.monitoring_id,
              monitoring_date: formatDateToISO(m.monitoring_date),
              efficacy_percent: m.efficacy_percent, // percent vs code?
              efficacy_code: mapEfficacyCode(m.efficacy_percent),
              invasive_species_agency_code: m.agency_code,
              project_code: [
                {
                  description: m.paper_file_id
                }
              ],
              general_comment: m.comment
            }))
          })),

          chemical_treatments: chemical_treatments.map((t) => ({
            // General treatment properties:
            treatment_id: t.TreatmentID,
            treatment_date: formatDateToISO(t.TreatmentDate),
            map_code: t.MapCode,
            reported_area: hectaresToM2(t.AreaTreated),
            // invasive_plant_code: 'NA', // TODO map common_name to plant code
            common_name: t.MapCommon,
            invasive_species_agency_code: t.TreatmentAgency,
            employer: t.Employer,
            project_code: [
              {
                description: t.PAPER_FILE_ID
              }
            ],
            general_comment: t.Comment,

            // Chem-Specific properties:
            chemical_method_code: chemMethodCodes[t.ChemicalMethodFull],
            chemical_method: t.ChemicalMethodFull,
            treatment_time: t.TreatmentTime,
            service_licence_number: t.Service_Licence_Number,
            pmp_confirmation_number: t.Pmp_Confirmation_Number,
            pmra_reg_number: t.Pmra_Reg_Number,
            pup_number: t.Pup_Number,
            liquid_herbicide_code: t.Herbicide_Code,
            herbicide_description: t.Description,
            dilution: t.Dilution_Rate,
            mix_delivery_rate: t.Delivery_Rate,
            tank_mix_id: t.Tank_Mix_Id,
            application_rate: t.Application_Rate,
            herbicide_amount: t.Amount_Used,
            temperature: t.Temperature,
            humidity: t.Humidity, // note: not mapped to increments of 10
            wind_speed: t.Wind_Velocity,
            // wind_direction_code
            wind_direction: t.Wind_Direction,
            wind_direction_code: mapAspect[t.Wind_Direction],
            monitoring: t.monitoring.map((m) => ({
              monitoring_id: m.monitoring_id,
              monitoring_date: formatDateToISO(m.inspection_date),
              efficacy_percent: m.EFFICACY_RATING_CODE,
              efficacy_code: mapEfficacyCode(m.EFFICACY_RATING_CODE),
              invasive_species_agency_code: m.invasive_plant_agency_code,
              project_code: [
                {
                  description: m.PAPER_FILE_ID
                }
              ],
              general_comment: m.comments
            }))
          })),

          biological_treatments: biological_treatments.map((t) => ({
            // General treatment properties:
            treatment_id: t.treatment_id,
            treatment_date: formatDateToISO(t.TREATMENT_DATE),
            map_code: t.MapCode,
            // no reported_area provided
            // invasive_plant_code: 'NA', // TODO map common_name to plant code
            common_name: t.CommonName,
            invasive_species_agency_code: t.Agency,
            project_code: [
              {
                description: t.PaperFileID
              }
            ],
            general_comment: t.COMMENTS,

            // Bio-Specific properties:
            classified_area_code: t.AREA_CLASSIFICATION_CODE,
            collection_date: formatDateToISO(t.COLLECTION_DATE),
            biological_agent_code: t.BIOLOGICAL_AGENT_CODE,
            agent_source: t.BIOAGENT_SOURCE,
            release_quantity: t.RELEASE_QUANTITY,
            stage_larva_ind: t.STAGE_LARVA_IND,
            stage_egg_ind: t.STAGE_EGG_IND,
            stage_pupa_ind: t.STAGE_PUPA_IND,
            stage_other_ind: t.STAGE_OTHER_IND,
            biological_agent_stage_code: mapBioAgentStageCode(t),
            // bioagent_maturity_status_code
            
            utm_zone: t.UTM_ZONE,
            utm_easting: t.UTM_EASTING,
            utm_northing: t.UTM_NORTHING,

            monitoring: t.monitoring.map((m) => ({
              monitoring_id: m.monitoring_id,
              monitoring_date: formatDateToISO(m.inspection_date),
              efficacy_code: undefined, // m.EFFICACY_RATING_CODE Note: all 0
              invasive_species_agency_code: undefined, // none provided
              project_code: [
                {
                  description: m.PAPER_FILE_ID
                }
              ],
              general_comment: m.Comment,

              // Bio-Specific Monitoring Properties
              plant_count: m.PLANT_COUNT,
              agent_count: m.AGENT_COUNT,
              count_duration: m.COUNT_DURATION,
              agent_destroyed_ind: mapYN(m.AGENT_DESTROYED_IND),
              legacy_presence_ind: mapYN(m.LEGACY_PRESENCE_IND),
              foliar_feeding_damage_ind: mapYN(m.FOLIAR_FEEDING_DAMAGE_IND),
              root_feeding_damage_ind: mapYN(m.ROOT_FEEDING_DAMAGE_IND),
              seed_feeding_damage_ind: mapYN(m.SEED_FEEDING_DAMAGE_IND),
              oviposition_marks_ind: mapYN(m.OVIPOSITION_MARKS_IND),
              eggs_present_ind: mapYN(m.EGGS_PRESENT_IND),
              larvae_present_ind: mapYN(m.LARVAE_PRESENT_IND),
              pupae_present_ind: mapYN(m.PUPAE_PRESENT_IND),
              adults_present_ind: mapYN(m.ADULTS_PRESENT_IND),
              tunnels_present_ind: mapYN(m.TUNNELS_PRESENT_IND),

              utm_zone: m.UTM_ZONE,
              utm_easting: m.UTM_EASTING,
              utm_northing: m.UTM_NORTHING
            }))
          })),

          biological_dispersals: biological_dispersals.map((d) => ({
            monitoring_id: d.biological_dispersal_id,
            monitoring_date: formatDateToISO(d.inspection_date),
            // no efficacy_code applicable
            map_code: d.map_symbol,
            common_name: d.common_name,
            invasive_species_agency_code: d.invasive_plant_agency_code,
            project_code: [
              {
                description: d.paper_file_id
              }
            ],
            general_comment: d.comments,

            // Dispersal-Specific Properties
            biological_dispersal_id: d.biological_dispersal_id,
            invasive_plant_code: d.invasive_plant_id,
            biological_agent_code: d.biological_agent_code,
            // invasive_plant_code: 'NA', // TODO map common_name to plant code
            plant_count: d.plant_count,
            agent_count: d.agent_count,
            count_duration: d.count_duration,
            foliar_feeding_damage_ind: mapYN(d.foliar_feeding_damage_ind),
            root_feeding_damage_ind: mapYN(d.root_feeding_damage_ind),
            seed_feeding_damage_ind: mapYN(d.seed_feeding_damage_ind),
            oviposition_marks_ind: mapYN(d.oviposition_marks_ind),
            eggs_present_ind: mapYN(d.eggs_present_ind),
            larvae_present_ind: mapYN(d.larvae_present_ind),
            pupae_present_ind: mapYN(d.pupae_present_ind),
            adults_present_ind: mapYN(d.adults_present_ind),
            tunnels_present_ind: mapYN(d.tunnels_present_ind),

            utm_zone: d.utm_zone,
            utm_easting: d.utm_easting,
            utm_northing: d.utm_northing
          }))
        }
      };

      pois.push(requestBody);
      batch++;
    }

    const tokenResp = await getToken();
    const token = tokenResp.data.access_token;
    const postconfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      // process.stdout.write(`${siteRecordID},`);
      if (pois?.length) await axios.post(urlstring, pois, postconfig);
    } catch (error) {
      console.log(error);
    }
  }
};

main();
