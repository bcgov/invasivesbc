import fs from 'fs';
import { AxiosRequestConfig } from 'axios';
import csv from 'csvtojson';
import axios from 'axios';
import qs from 'qs';

const meow = require('meow');

const formatDateToISO = (d) => d.getFullYear() + '-'
  + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
  + ('0' + d.getDate()).slice(-2);


// return items matching field value in an array of objects sorted by field
// https://www.w3resource.com/javascript-exercises/javascript-array-exercise-18.php
const binarySearchValues = (items, field, value) => {
    if (items === undefined)
      return [];
    let firstIndex  = 0;
    let lastIndex   = items.length - 1;
    let middleIndex = Math.floor((lastIndex + firstIndex)/2);

    while(items[middleIndex][field] != value && firstIndex < lastIndex) {
      if (value < items[middleIndex][field]) {
        lastIndex = middleIndex - 1;
      } else if (value > items[middleIndex][field]){
        firstIndex = middleIndex + 1;
      }
      middleIndex = Math.floor((lastIndex + firstIndex)/2);
    }

    if (items[middleIndex][field] != value)
      return [];

    // get multiple matches:
    firstIndex = lastIndex = middleIndex;
    while (firstIndex > 0 && items[firstIndex - 1][field] == value)
      firstIndex = firstIndex - 1;
    while (lastIndex < items.length - 1 && items[lastIndex + 1][field] == value)
      lastIndex = lastIndex + 1;

    return items.slice(firstIndex, lastIndex + 1);
}

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
      --dispersal: SiteID ASC
      --bioControlOutput: SiteID ASC

    OUTPUT:
      Data will be sorted according to:
      --site: SiteID DESC
      --survey: MechanicalID DESC
      --mechanicalTreatment: TreatmentID DESC
      --mechanicalMonitoring: monitoring_id DESC
      --chemicalTreatment: TreatmentID DESC
      --chemicalMonitoring: treatment_id DESC
      --dispersal: SiteID DESC
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
    let results = [];
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
    console.log(results.mechanicalTreatmentData.length + ' mech mechanical treatments loaded.');
  }

  if (cli.flags.mechanicalMonitoring) {
    console.log('Loading mechanical monitoring...');
    results.mechanicalMonitoringData = await loadACSV(cli.flags.mechanicalMonitoring);
    console.log(results.mechanicalMonitoringData.length + ' mech monitoring records loaded.');
  }

  if (cli.flags.chemicalTreatment) {
    console.log('Loading chemical treatments...');
    results.mechanicalTreatmentData = await loadACSV(cli.flags.chemicalTreatment);
    console.log(results.mechanicalTreatmentData.length + ' chem mechanical treatments loaded.');
  }

  if (cli.flags.chemicalMonitoring) {
    console.log('Loading chemical monitoring...');
    results.chemicalMonitoringData = await loadACSV(cli.flags.chemicalMonitoring);
    console.log(results.chemicalMonitoringData.length + ' chem monitoring records loaded.');
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
const urlstring = 'https://api-dev-invasivesbci.pathfinder.gov.bc.ca/api/point-of-interest';

const main = async () => {
  const IAPPData = await loadAllData();

  let count1 = 0;

  // assumes site CSV sorted by SiteID DESC
  while (count1 < 10000) {
    const siteRecord = IAPPData.siteData[count1];
    const siteRecordID = siteRecord['SiteID'];

    // assumes surveys CSV sorted by SiteID ASC
    let surveys = binarySearchValues(IAPPData.surveyData, 'SiteID', siteRecordID);
    surveys = surveys.map((survey) => ({
      ...survey,
      SurveyDate: formatDateToISO(new Date(survey.surveyDate))
    }));
    // restore desired sorting order by MechanicalID DESC (latest first)
    surveys.sort((a,b) => Number(b.MechanicalID) - Number(a.MechanicalID));

    // assumes mechtreatements CSV sorted by SiteID ASC
    let mechanical_treatments = binarySearchValues(IAPPData.mechanicalTreatmentData, 'SiteID', siteRecordID);
    mechanical_treatments = mechanical_treatments.map((treatment) => {
      // assumes monitoring CSV sorted by treatment_id ASC
      treatment.monitoring = binarySearchValues(IAPPData.mechanicalMonitoringData, 'treatment_id', treatment.TreatmentID);
      // restore desired sorting order by monitoring_id DESC (latest first)
      treatment.monitoring.sort((a,b) => Number(b.monitoring_id) - Number(a.monitoring_id));
      return treatment;
    });
    // restore desired sorting order by TreatmentID DESC (latest first)
    mechanical_treatments.sort((a,b) => Number(b.TreatmentID) - Number(a.TreatmentID));

    // assumes chemtreatements CSV sorted by SiteID ASC
    let chemical_treatments = binarySearchValues(IAPPData.chemicalTreatmentData, 'SiteID', siteRecordID);
    chemical_treatments = chemical_treatments.map((treatment) => {
      // assumes monitoring CSV sorted by treatment_id ASC
      treatment.monitoring = binarySearchValues(IAPPData.chemicalMonitoringData, 'treatment_id', treatment.TreatmentID);
      // restore desired sorting order by treatment_id DESC (latest first)
      treatment.monitoring.sort((a,b) => Number(b.monitoring_id) - Number(a.monitoring_id));
      return treatment;
    });
    // restore desired sorting order by TreatmentID DESC (latest first)
    chemical_treatments.sort((a,b) => Number(b.TreatmentID) - Number(a.TreatmentID));

    count1++;

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
          jurisdiction_code: 'Not provided',
          point_of_interest_status: 'pending',
          invasive_species_agency_code: 'Not provided',
          access_description: siteRecord.Locations,
          media_indicator: false,
          created_date_on_device: siteRecord.CreateDate,
          updated_date_on_device: siteRecord.CreateDate,
          general_comment: siteRecord.comments,
          paper_file: [
            {
              description: siteRecord.PaperFile
            }
          ]
        },
        point_of_interest_type_data: {
          slope: siteRecord.Slope,
          elevation: siteRecord.Elevation,
          site_id: siteRecordID,
          created_date: siteRecord.CreateDate,
          aspect: siteRecord.Aspect,
          original_bec_id: siteRecord.BEC_ID,
          map_sheet: siteRecord.Mapsheet,
          specific_use: siteRecord.SpecificUse,
          soil_texture: siteRecord.SoilTexture,
          comments: siteRecord.Comments,
          species: [],
          surveys: surveys,
          mechanical_treatments: mechanical_treatments,
          chemical_treatments: chemical_treatments
        }
      }
    };

    let tokenResp = await getToken();
    let token = tokenResp.data.access_token;
    let postconfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      // process.stdout.write(`${siteRecordID},`);
      await axios.post(urlstring, requestBody, postconfig);
    } catch (error) {
      console.log(error);
    }
  }
};

main();
