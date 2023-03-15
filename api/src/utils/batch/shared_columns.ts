import {TemplateColumnBuilder} from './definitions';

export const BasicInformation = [
  new TemplateColumnBuilder('Basic - Date', 'date').isRequired().build(),
  new TemplateColumnBuilder('Basic - Latitude', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - Longitude', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - UTM Easting', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - UTM Northing', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - UTM Zone', 'text').isRequired().build(),
  new TemplateColumnBuilder('Basic - Employer', 'codeReference').isRequired().referencesCode('employer_code').build(),
  new TemplateColumnBuilder('Basic - Funding Agency', 'codeReference')
    .isRequired().build(),
  new TemplateColumnBuilder('Basic - Access Description', 'text').isRequired().build(),
  new TemplateColumnBuilder('Basic - Location Description', 'text').isRequired().build(),

  new TemplateColumnBuilder('Basic - Jurisdiction 1', 'codeReference')
    .isRequired()
    .referencesCode('jurisdiction_code')
    .build(),

  new TemplateColumnBuilder('Basic - Jurisdiction 1 % Covered', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Basic - Jurisdiction 2', 'codeReference')
    .referencesCode('jurisdiction_code')
    .build(),

  new TemplateColumnBuilder('Basic - Jurisdiction 2 % Covered', 'numeric').build(),
  new TemplateColumnBuilder('Basic - Jurisdiction 3', 'codeReference').referencesCode('jurisdiction_code')
    .build(),
  new TemplateColumnBuilder('Basic - Jurisdiction 3 % Covered', 'numeric').build()
];

export const ActivityPersons = [
  new TemplateColumnBuilder('Activity - Person 1', 'text').isRequired().build(),
  new TemplateColumnBuilder('Activity - Person 2', 'text').build()
];

export const ActivityPersonsWithApplicatorLicense = [
  new TemplateColumnBuilder('Activity - Person 1', 'text').isRequired().build(),
  new TemplateColumnBuilder('Activity - Person 1 Applicator License', 'text').isRequired().build(),
  new TemplateColumnBuilder('Activity - Person 2', 'text').build(),
  new TemplateColumnBuilder('Activity - Person 2 Applicator License', 'text').build()
];

export const ProjectInformation = [
  new TemplateColumnBuilder('Project - Code', 'text').build(),
  new TemplateColumnBuilder('Project - Comment', 'text').build()
];

export const VoucherInformation = [
  new TemplateColumnBuilder('Voucher - Sample Collected?', 'boolean').build(),
  new TemplateColumnBuilder('Voucher - Accession Number', 'text').build(),
  new TemplateColumnBuilder('Voucher - UTM Zone', 'text').build(),
  new TemplateColumnBuilder('Voucher - UTM Easting', 'numeric').build(),
  new TemplateColumnBuilder('Voucher - UTM Northing', 'numeric').build(),
  new TemplateColumnBuilder('Voucher - Name of Herbarium', 'text').build(),
  new TemplateColumnBuilder('Voucher - Sample ID', 'text').build(),
  new TemplateColumnBuilder('Voucher - Date Verified', 'date').build(),
  new TemplateColumnBuilder('Voucher - Date Collected', 'date').build(),
  new TemplateColumnBuilder('Voucher - Person', 'text').build(),
  new TemplateColumnBuilder('Voucher - Organization', 'text').build()
];

export const WellInformation = [
  new TemplateColumnBuilder('Wells - Well 1 ID', 'numeric').build(),
  new TemplateColumnBuilder('Wells - Well 1 proximity', 'numeric').build(),
  new TemplateColumnBuilder('Wells - Well 2 ID', 'numeric').build(),
  new TemplateColumnBuilder('Wells - Well 2 proximity', 'numeric').build(),
  new TemplateColumnBuilder('Wells - Well 3 ID', 'numeric').build(),
  new TemplateColumnBuilder('Wells - Well 3 proximity', 'numeric').build()
];

export const WeatherInformation = [
  new TemplateColumnBuilder('Weather - Temperature', 'numeric').build(),
  new TemplateColumnBuilder('Weather - Wind Speed', 'numeric').build(),
  new TemplateColumnBuilder('Weather - Wind Aspect', 'numeric').build(),
  new TemplateColumnBuilder('Weather - Cloud Cover', 'codeReference').referencesCode('cloud_cover_code').build(),
  new TemplateColumnBuilder('Weather - Precipitation', 'codeReference').referencesCode('precipitation_code').build(),
  new TemplateColumnBuilder('Weather - Comments', 'text').build()
];

export const MicrositeConditions = [
  new TemplateColumnBuilder('Microsite Conditions - Mesoslope Position', 'codeReference').referencesCode('mesoslope_position_code').build(),
  new TemplateColumnBuilder('Microsite Conditions - Surface Shape', 'codeReference').referencesCode('cloud_cover_code').build()
];

export const ShorelineInformation = [
  new TemplateColumnBuilder('Shoreline - Shoreline 1 Type', 'codeReference').referencesCode('shoreline_type_code').build(),
  new TemplateColumnBuilder('Shoreline - Shoreline 1 Percentage', 'numeric').build(),
  new TemplateColumnBuilder('Shoreline - Shoreline 2 Type', 'codeReference').referencesCode('shoreline_type_code').build(),
  new TemplateColumnBuilder('Shoreline - Shoreline 2 Percentage', 'numeric').build()
];

export const WaterbodyInformation = [
  new TemplateColumnBuilder('Waterbody - Type', 'codeReference').isRequired().referencesCode('shoreline_type_code').build(),
  new TemplateColumnBuilder('Waterbody - Tidal?', 'boolean').build(),
  new TemplateColumnBuilder('Waterbody - Name', 'text').build(),
  new TemplateColumnBuilder('Waterbody - Name Gazetted', 'text').build(),

  new TemplateColumnBuilder('Waterbody - Water Level Management', 'codeReference').build(),

  new TemplateColumnBuilder('Waterbody - Use', 'codeReference').referencesCode('waterbody_user_code').build(),
  new TemplateColumnBuilder('Waterbody - Adjacent Land Usage', 'codeReference').referencesCode('adjacent_land_use_code').build(),
  new TemplateColumnBuilder('Waterbody - Substrate', 'codeReference').referencesCode('surface_substrate_code').build(),

  new TemplateColumnBuilder('Waterbody - Inflow - Permanent', 'codeReference').referencesCode('inflow_permanent_code').build(),
  new TemplateColumnBuilder('Waterbody - Inflow - Other', 'codeReference').referencesCode('inflow_temporary_code').build(),

  new TemplateColumnBuilder('Waterbody - Outflow - Permanent', 'codeReference').referencesCode('outflow_code').build(),
  new TemplateColumnBuilder('Waterbody - Outflow - Seasonal', 'codeReference').referencesCode('outflow_code').build(),

  new TemplateColumnBuilder('Waterbody - Access', 'text').build(),
  new TemplateColumnBuilder('Waterbody - Comment', 'text').build()
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
  new TemplateColumnBuilder('Chemical Treatment - Service License', 'codeReference').isRequired().referencesCode('service_license_code').build(),
  new TemplateColumnBuilder('Chemical Treatment - PUP', 'text').build(),
  new TemplateColumnBuilder('Chemical Treatment - PMP', 'codeReference').referencesCode('pest_management_plan').build(),
  new TemplateColumnBuilder('Chemical Treatment - PMP Unlisted', 'text').build(),
  new TemplateColumnBuilder('Chemical Treatment - Temperature', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Wind Speed', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Wind Direction', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Humidity', 'numeric').build(),

  new TemplateColumnBuilder('Chemical Treatment - Treatment Notice Signs', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Precautionary Statement', 'codeReference').referencesCode('precautionary_statement_code').build(),

  new TemplateColumnBuilder('Chemical Treatment - NTZ Reduction', 'boolean').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - NTZ Reduction Rationale', 'text').build(),

  new TemplateColumnBuilder('Chemical Treatment - Start Time', 'datetime').isRequired().build(),

  new TemplateColumnBuilder('Chemical Treatment - Unmapped Wells?', 'boolean').isRequired().build(),

  new TemplateColumnBuilder('Chemical Treatment - Pest Injury Threshold Determination Done?', 'boolean')
    .isRequired()
    .build(),

  new TemplateColumnBuilder('Chemical Treatment - Application Method', 'codeReference').referencesCode('chemical_method_code').build()
];


export const HerbicidesInformation = [
  new TemplateColumnBuilder('Herbicide - Tank Mix?', 'boolean').isRequired().build(),

  new TemplateColumnBuilder('Herbicide - 1 - Type', 'codeReference').referencesCode('herbicide_type_code').isRequired().build(),
  new TemplateColumnBuilder('Herbicide - 1 - Herbicide', 'codeReference').referencesCode(['granular_herbicide_code', 'liquid_herbicide_code']).isRequired().build(),
  new TemplateColumnBuilder('Herbicide - 1 - Calculation Type', 'codeReference').referencesCode('calculation_type_code').build(),
  new TemplateColumnBuilder('Herbicide - 1 - PAR - Delivery Rate of Mix', 'numeric').build(),
  new TemplateColumnBuilder('Herbicide - 1 - PAR - Production Application Rate', 'numeric').build(),
  new TemplateColumnBuilder('Herbicide - 1 - Dilution - Dilution %', 'numeric').build(),

  new TemplateColumnBuilder('Herbicide - 2 - Type', 'codeReference').referencesCode('herbicide_type_code').build(),
  new TemplateColumnBuilder('Herbicide - 2 - Herbicide', 'codeReference').referencesCode(['granular_herbicide_code', 'liquid_herbicide_code']).build(),
  new TemplateColumnBuilder('Herbicide - 2 - Calculation Type', 'codeReference').referencesCode('calculation_type_code').build(),
  new TemplateColumnBuilder('Herbicide - 2 - PAR - Delivery Rate of Mix', 'numeric').build(),
  new TemplateColumnBuilder('Herbicide - 2 - PAR - Production Application Rate', 'numeric').build(),
  new TemplateColumnBuilder('Herbicide - 2 - Dilution - Dilution %', 'numeric').build(),

  new TemplateColumnBuilder('Herbicide - Area Treated', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Herbicide - Amount of Mix Used', 'numeric').build()

];
