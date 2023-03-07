import {TemplateColumnBuilder} from "./definitions";

export const BasicInformation = [
  new TemplateColumnBuilder('Basic - Date', 'date').isRequired().build(),
  new TemplateColumnBuilder('Basic - Latitude', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - Longitude', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - UTM Easting', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - UTM Northing', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - UTM Zone', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Basic - Employer', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Basic - Funding Agency', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Basic - Access Description', 'text').isRequired().build(),
  new TemplateColumnBuilder('Basic - Location Description', 'text').isRequired().build(),
  new TemplateColumnBuilder('Jurisdiction 1', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Jurisdiction 1 % Covered', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Jurisdiction 2', 'codeReference').build(),
  new TemplateColumnBuilder('Jurisdiction 2 % Covered', 'numeric').build(),
  new TemplateColumnBuilder('Jurisdiction 3', 'codeReference').build(),
  new TemplateColumnBuilder('Jurisdiction 3 % Covered', 'numeric').build()
];

export const ActivityPersons = [
  new TemplateColumnBuilder('Activity Person 1', 'text').isRequired().build(),
  new TemplateColumnBuilder('Activity Person 2', 'text').build()
];

export const ActivityPersonsWithApplicatorLicense = [
  new TemplateColumnBuilder('Activity Person 1', 'text').isRequired().build(),
  new TemplateColumnBuilder('Applicator License 1', 'text').isRequired().build(),
  new TemplateColumnBuilder('Activity Person 2', 'text').build(),
  new TemplateColumnBuilder('Applicator License 2', 'text').build()
];

export const ProjectInformation = [
  new TemplateColumnBuilder('Project Code', 'text').build(),
  new TemplateColumnBuilder('Project Comment', 'text').build()
];

export const WellInformation = [
  new TemplateColumnBuilder('Well 1 ID', 'numeric').build(),
  new TemplateColumnBuilder('Well 1 proximity', 'numeric').build(),
  new TemplateColumnBuilder('Well 2 ID', 'numeric').build(),
  new TemplateColumnBuilder('Well 2 proximity', 'numeric').build(),
  new TemplateColumnBuilder('Well 3 ID', 'numeric').build(),
  new TemplateColumnBuilder('Well 3 proximity', 'numeric').build()
];

export const WeatherInformation = [
  new TemplateColumnBuilder('Weather - Temperature', 'numeric').build(),
  new TemplateColumnBuilder('Weather - Wind Speed', 'numeric').build(),
  new TemplateColumnBuilder('Weather - Wind Aspect', 'numeric').build(),
  new TemplateColumnBuilder('Weather - Cloud Cover', 'codeReference').build(),
  new TemplateColumnBuilder('Weather - Precipitation', 'codeReference').build(),
  new TemplateColumnBuilder('Weather - Comments', 'text').build()
];

export const MicrositeConditions = [
  new TemplateColumnBuilder('Microsite Conditions - Position Code', 'codeReference').build(),
  new TemplateColumnBuilder('Microsite Conditions - Surface Shape Code', 'codeReference').build()
];

export const ShorelineInformation = [
  new TemplateColumnBuilder('Shoreline 1 Type', 'codeReference').build(),
  new TemplateColumnBuilder('Shoreline 1 Percentage', 'numeric').build(),
  new TemplateColumnBuilder('Shoreline 2 Type', 'codeReference').build(),
  new TemplateColumnBuilder('Shoreline 2 Percentage', 'numeric').build()
];

export const WaterbodyInformation = [
  new TemplateColumnBuilder('Waterbody - Outflow', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Inflow - Permanent', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Inflow - Other', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Use', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Substrate', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Type', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Tidal?', 'boolean').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Name', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Adjacent Land Usage', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Name Gazetted', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Waterbody - Water Level Management', 'codeReference').isRequired().build()
];

export const WaterQualityInformation = [
  new TemplateColumnBuilder('Water - Max Depth', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Water - Secchi Depth', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Water - Colour', 'text').isRequired().build()
];

export const PhenologyInformation = [
  new TemplateColumnBuilder('Phenology - Details Recorded?', 'boolean').build(),
  new TemplateColumnBuilder('Phenology - Target Height', 'numeric').build(),
  new TemplateColumnBuilder('Phenology - Bolts', 'numeric').build(),
  new TemplateColumnBuilder('Phenology - Rosettes', 'numeric').build(),
  new TemplateColumnBuilder('Phenology - Flowering', 'numeric').build(),
  new TemplateColumnBuilder('Phenology - Seedlings', 'numeric').build(),
  new TemplateColumnBuilder('Phenology - Senescent', 'numeric').build(),
  new TemplateColumnBuilder('Phenology - Seeds Forming', 'numeric').build(),
  new TemplateColumnBuilder('Phenology - Winter Dormant', 'numeric').build()
];

export const ChemicalPlantTreatmentInformation = [
//   "Treatment_ChemicalPlant_Information": {
//   "humidity": 20,
//     "wind_speed": 8,
//     "temperature": 20,
//     "ntz_reduction": false,
//     "unmapped_wells": true,
//     "signage_on_site": "Yes",
//     "wind_direction_code": "W",
//     "pest_management_plan": "FLNR PMP 402-0680-20/25",
//     "application_start_time": "2022-10-04T19:56:00.000Z",
//     "pesticide_employer_code": "0",
//     "precautionary_statement": "DRY",
//     "pesticide_use_permit_PUP": "none"
// }
];

export const MechanicalPlantTreatmentInformation = [];
