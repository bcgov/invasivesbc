import fs from 'fs';
import { allowedNodeEnvironmentFlags } from 'process';
import csv from 'csv-parser'

const meow = require('meow');

const cli = meow(`
	Usage
	  $ IAPP_Migrate [[OPTION] [FILENAME] [OPTION] [FILENAME]...] ENDPOINT

	Options
	  --site fileName, -si fileName
	  --survey fileName, -su fileName
	  --treatment fileName, -t fileName
	  --monitoring fileName, -s fileName
	  --dispersal fileName, -d fileName
	  --biocontroloutput fileName, -b fileName

  Examples
    Load just sites:
	  $ IAPP_Migragte --site sites.csv http://point_of_interest_endpoint/
    Load more:
	  $ IAPP_Migragte -si sites.csv -su surveys.csv -t treatments.csv -m monitoring.csv http://point_of_interest_endpoint
`, {
	flags: {
		site: {
			type: 'string',
      alias: 'si',
      isRequired: true
		},
		survey: {
			type: 'string',
      alias: 'su',
      isRequired: true
		},
		treatment: {
			type: 'string',
      alias: 't',
      isRequired: true
		},
		monitoring: {
			type: 'string',
      alias: 'm',
      isRequired: true
		},
		dispersal: {
			type: 'string',
      alias: 'd',
      isRequired: true
		},
	}
});
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

const siteData = []
const surveyData = []
const treatmentData = []
const monitoringData = []
const dispersalData = []
const bioControlOutputData = []


const loadACSV = async (fileName: string, output: Array<Object>) => {
  fs.createReadStream(fileName,'utf8').pipe(csv())
  .on('data', (data) => output.push(data))
  .on('end', () => {
    // any wrap up goes here
  })
}

const loadAllData = () => {
  if(!cli.flags.site){
    return
  }
  loadACSV(cli.flags.site, siteData)

  if(cli.flags.survey){
    loadACSV(cli.flags.survey, surveyData)
  }

  if(cli.flags.treatment){
    loadACSV(cli.flags.treatment, treatmentData)
  }

  if(cli.flags.monitoring){
    loadACSV(cli.flags.monitoring, monitoringData)
  }

  if(cli.flags.bio){
    loadACSV(cli.flags.monitoring, monitoringData)
  }
}


const site_data_linked = () => {
  return []
}

// todo: flush out JSON for complete IAPP message.
site_data_linked().map((record) => {
  const body = `
  {
    "point_of_interest_type": "IAPP Site",
    "point_of_interest_subtype": "First Load",
    "media": [

    ],
    "geometry": [
       {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [ {{OFF_Longitude}}, {{OFF_Latitude}}]

  },  "properties": {
    "name": "Dinagat Islands"
  }}

    ],
    "form_data": {
        "point_of_interest_data": {
            "jurisdiction_code": "Not provided",
            "point_of_interest_status": "pending",
            "species_agency_code": "${record.species_agency_code}",
            "access_description": "Over yonder",
            "media_indicator": false,
            "created_date_on_device": "2015-03-25",
            "updated_date_on_device": "2015-03-25",
            "general_comment": "{{Comments}}",
            "paper_file": [
                {
                    "description": "{{PaperFile}}"
                }
            ]
        },
        "point_of_interest_type_data": {
            "site_id": "{{SiteID}}",
            "created_date": "{{CreateDate}}",
            "aspect": "{{Aspect}}",
            "original_bec_id": "{{BEC_ID}}",
            "map_sheet": "{{Mapsheet}}",
            "specific_use": "{{SpecificUse}}",
            "soil_texture": "{{SoilTexture}}",
            "comments": "{{Comments}}",
            "species": [
                "banana",
                "apple"
            ]
        }
    }
}
`
})


