import fs from 'fs';
import { AxiosRequestConfig } from 'axios';
import csv from 'csvtojson';
import axios from 'axios';
import qs from 'qs';

const meow = require('meow');

const cli = meow(
  /*
    Usage
      $ IAPP_Migrate [[OPTION] [FILENAME] [OPTION] [FILENAME]...] ENDPOINT

    Options
      --site fileName, -si fileName
      --survey fileName, -su fileName
      --mechanicalTreatment fileName, -mt fileName
      --monitoring fileName, -s fileName
      --dispersal fileName, -d fileName
      --bioControlOutput fileName, -b fileName

    Examples
      Load just sites:
      $ IAPP_Migrate --site sites.csv http://point_of_interest_endpoint/
      Load more:
      $ IAPP_Migrate -si sites.csv -su surveys.csv -t treatments.csv -m monitoring.csv http://point_of_interest_endpoint
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
      monitoring: {
        type: 'string',
        alias: 'm',
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
  monitoringData?: any[];
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
    console.log('Loading treatments...');
    results.mechanicalTreatmentData = await loadACSV(cli.flags.mechanicalTreatment);
    console.log(results.mechanicalTreatmentData.length + ' mechanical treatments loaded.');
  }

  if (cli.flags.monitoring) {
    console.log('Loading monitoring...');
    results.monitoringData = await loadACSV(cli.flags.monitoring);
    console.log(results.monitoringData.length + ' monitoring records loaded.');
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
  while (count1 < 10000) {
    const siteRecord = IAPPData.siteData[count1];
    const siteRecordID = siteRecord['SiteID'];

    const surveys = [];

    let count2 = 0;
    while (count2 < IAPPData.surveyData.length) {
      const surveyRecord = IAPPData.surveyData[count2];
      const surveyRecordID = surveyRecord['SiteID'];

      if (surveyRecordID == siteRecordID) {
        surveys.push(surveyRecord);
      }

      count2++;
    }

    const mechanical_treatments = [];

    let count3 = 0;
    while (count3 < IAPPData.mechanicalTreatmentData.length) {
      const mechanicalTreatmentRecord = IAPPData.mechanicalTreatmentData[count3];
      const mechanicalTreatmentRecordID = mechanicalTreatmentRecord['SiteID'];

      if (mechanicalTreatmentRecordID == siteRecordID) {
        mechanical_treatments.push(mechanicalTreatmentRecord);
      }

      count3++;
    }

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
          species_agency_code: 'Not provided',
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
          mechanical_treatments: mechanical_treatments
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
      console.log(error.response.data);
    }
  }
};

main();
