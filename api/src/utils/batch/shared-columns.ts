import { TemplateColumnBuilder } from './definitions';
import { RowValidationResult } from './validation/validation';
import { WIND_DIRECTION_CODES } from './hard-coded-codes';

export const BasicInformation = [
  new TemplateColumnBuilder('WKT', 'WKT', {
    geojson: 'geometry',
    area: 'form_data.activity_data.reported_area',
    latitude: 'form_data.activity_data.latitude',
    longitude: 'form_data.activity_data.longitude',
    utm_zone: 'form_data.activity_data.utm_zone',
    utm_northing: 'form_data.activity_data.utm_northing',
    utm_easting: 'form_data.activity_data.utm_easting'
  })
    .isRequired()
    .build(),
  new TemplateColumnBuilder('Basic - Date', 'date', 'form_data.activity_data.activity_data_time')
    .isRequired()
    .mustNotBeFuture()
    .build(),
  new TemplateColumnBuilder('Basic - Employer', 'codeReference', 'form_data.activity_data.employer_code')
    .isRequired()
    .referencesCode('employer_code')
    .build(),
  new TemplateColumnBuilder(
    'Basic - Funding Agency',
    'codeReference',
    'form_data.activity_data.invasive_species_agency_code'
  )
    .referencesCode('invasive_species_agency_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder('Basic - Access Description', 'text', 'form_data.activity_data.access_description')
    .isRequired()
    .lengthRange(5, 300)
    .build(),
  new TemplateColumnBuilder('Basic - Location Description', 'text', 'form_data.activity_data.location_description')
    .isRequired()
    .lengthRange(5, 2000)
    .build(),

  new TemplateColumnBuilder(
    'Basic - Jurisdiction 1',
    'codeReference',
    'form_data.activity_data.jurisdictions[0].jurisdiction_code'
  )
    .isRequired()
    .referencesCode('jurisdiction_code')
    .build(),

  new TemplateColumnBuilder(
    'Basic - Jurisdiction 1 % Covered',
    'numeric',
    'form_data.activity_data.jurisdictions[0].percent_covered'
  )
    .valueRange(0, 100)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Basic - Jurisdiction 2',
    'codeReference',
    'form_data.activity_data.jurisdictions[1].jurisdiction_code'
  )
    .referencesCode('jurisdiction_code')
    .build(),

  new TemplateColumnBuilder(
    'Basic - Jurisdiction 2 % Covered',
    'numeric',
    'form_data.activity_data.jurisdictions[1].percent_covered'
  )
    .valueRange(0, 100)
    .build(),
  new TemplateColumnBuilder(
    'Basic - Jurisdiction 3',
    'codeReference',
    'form_data.activity_data.jurisdictions[2].jurisdiction_code'
  )
    .referencesCode('jurisdiction_code')
    .build(),
  new TemplateColumnBuilder(
    'Basic - Jurisdiction 3 % Covered',
    'numeric',
    'form_data.activity_data.jurisdictions[2].percent_covered'
  )
    .valueRange(0, 100)
    .build()
];

export const SummingValidator = (fields: string[], mustSumTo: number, messageOnInvalid: string) => {
  return (row): RowValidationResult => {
    const rowData = row.data;

    let sum = 0;
    let valid = true;
    const validationMessages = [];

    for (const f of fields) {
      if (rowData?.[f]?.parsedValue !== null && !isNaN(rowData?.[f]?.parsedValue)) {
        sum += rowData?.[f]?.parsedValue;
      }
    }

    if (sum !== 100) {
      valid = false;
      validationMessages.push({
        severity: 'error',
        messageTitle: messageOnInvalid,
        messageDetail: `'Actual sum: ${sum} != 100`
      });
    }

    return {
      valid,
      validationMessages,
      appliesToFields: fields
    };
  };
};
const _JurisdictionSumValidator = SummingValidator(
  ['Basic - Jurisdiction 1 % Covered', 'Basic - Jurisdiction 2 % Covered', 'Basic - Jurisdiction 3 % Covered'],
  100,
  'Jurisdiction coverages must sum to 100%'
);

const LinkedRecordsValidator = (linkedRecords) => {
  return (row): RowValidationResult => {
    const rowData = row.data;
    let valid = true;
    const validationMessages = [];
    const impactedFields = [];

    let atleastOneSet = false;
    let allSet = true;
    for (const f of linkedRecords) {
      if (rowData?.[f]?.parsedValue) {
        atleastOneSet = true;
      } else {
        allSet = false;
      }
    }
    if (atleastOneSet && !allSet) {
      valid = false;
      validationMessages.push({
        severity: 'error',
        messageTitle: 'This column is linked to another, and at least one required value is missing',
        messageDetail: `Linked columns: [${linkedRecords.join(', ')}]`
      });
      impactedFields.push(...linkedRecords);
    }

    return {
      valid,
      validationMessages,
      appliesToFields: impactedFields
    };
  };
};

export const BasicInformationRowValidators = [
  _JurisdictionSumValidator,
  LinkedRecordsValidator(['Basic - Jurisdiction 2', 'Basic - Jurisdiction 2 % Covered']),
  LinkedRecordsValidator(['Basic - Jurisdiction 3', 'Basic - Jurisdiction 3 % Covered'])
];

export const ActivityPersons = [
  new TemplateColumnBuilder(
    'Activity - Person 1',
    'text',
    'form_data.activity_type_data.activity_persons[0].person_name'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Activity - Person 2',
    'text',
    'form_data.activity_type_data.activity_persons[1].person_name'
  ).build()
];

export const ActivityPersonsWithApplicatorLicense = [
  new TemplateColumnBuilder(
    'Activity - Person 1',
    'text',
    'form_data.activity_type_data.activity_persons[0].person_name'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Activity - Person 1 Applicator License',
    'numeric',
    'form_data.activity_type_data.activity_persons[0].applicator_license'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Activity - Person 2',
    'text',
    'form_data.activity_type_data.activity_persons[1].person_name'
  ).build(),
  new TemplateColumnBuilder(
    'Activity - Person 2 Applicator License',
    'numeric',
    'form_data.activity_type_data.activity_persons[1].applicator_license'
  ).build()
];

export const ProjectInformation = [
  new TemplateColumnBuilder('Project - Code', 'text', 'form_data.activity_data.project_code[0].description').build(),
  new TemplateColumnBuilder('Project - Comment', 'text', 'form_data.activity_data.general_comment').build()
];

export const WellInformation = [
  new TemplateColumnBuilder(
    'Wells - Well 1 ID',
    'text',
    'form_data.activity_subtype_data.Well_Information[0].well_id'
  ).build(),
  new TemplateColumnBuilder(
    'Wells - Well 1 proximity',
    'text',
    'form_data.activity_subtype_data.Well_Information[0].well_proximity'
  ).build(),
  new TemplateColumnBuilder(
    'Wells - Well 2 ID',
    'text',
    'form_data.activity_subtype_data.Well_Information[1].well_id'
  ).build(),
  new TemplateColumnBuilder(
    'Wells - Well 2 proximity',
    'text',
    'form_data.activity_subtype_data.Well_Information[1].well_proximity'
  ).build(),
  new TemplateColumnBuilder(
    'Wells - Well 3 ID',
    'text',
    'form_data.activity_subtype_data.Well_Information[2].well_id'
  ).build(),
  new TemplateColumnBuilder(
    'Wells - Well 3 proximity',
    'text',
    'form_data.activity_subtype_data.Well_Information[2].well_proximity'
  ).build()
];

export const WeatherInformation = [
  new TemplateColumnBuilder(
    'Weather - Temperature',
    'numeric',
    'form_data.activity_subtype_data.Weather_Conditions.temperature'
  ).build(),
  new TemplateColumnBuilder(
    'Weather - Wind Speed',
    'numeric',
    'form_data.activity_subtype_data.Weather_Conditions.wind_speed'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Weather - Wind Aspect',
    'numeric',
    'form_data.activity_subtype_data.Weather_Conditions.wind_aspect'
  )
    .valueRange(0, 359)
    .build(),
  new TemplateColumnBuilder(
    'Weather - Cloud Cover',
    'codeReference',
    'form_data.activity_subtype_data.Weather_Conditions.cloud_cover_code'
  )
    .referencesCode('cloud_cover_code')
    .build(),
  new TemplateColumnBuilder(
    'Weather - Precipitation',
    'codeReference',
    'form_data.activity_subtype_data.Weather_Conditions.precipitation_code'
  )
    .referencesCode('precipitation_code')
    .build(),
  new TemplateColumnBuilder(
    'Weather - Comments',
    'text',
    'form_data.activity_subtype_data.Weather_Conditions.weather_comments'
  ).build()
];

export const MicrositeConditions = [
  new TemplateColumnBuilder(
    'Microsite Conditions - Mesoslope Position',
    'codeReference',
    'form_data.activity_subtype_data.Microsite_Conditions.mesoslope_position_code'
  )
    .referencesCode('mesoslope_position_code')
    .build(),
  new TemplateColumnBuilder(
    'Microsite Conditions - Surface Shape',
    'codeReference',
    'form_data.activity_subtype_data.Microsite_Conditions.site_surface_shape_code'
  ).build()
];

export const ShorelineInformation = [
  new TemplateColumnBuilder(
    'Shoreline - Shoreline 1 Type',
    'codeReference',
    'form_data.activity_subtype_data.ShorelineTypes[0].shoreline_type'
  )
    .referencesCode('shoreline_type_code')
    .build(),
  new TemplateColumnBuilder(
    'Shoreline - Shoreline 1 Percentage',
    'numeric',
    'form_data.activity_subtype_data.ShorelineTypes[0].percent_covered'
  )
    .valueRange(0, 100)
    .build(),
  new TemplateColumnBuilder(
    'Shoreline - Shoreline 2 Type',
    'codeReference',
    'form_data.activity_subtype_data.ShorelineTypes[1].shoreline_type'
  )
    .referencesCode('shoreline_type_code')
    .build(),
  new TemplateColumnBuilder(
    'Shoreline - Shoreline 2 Percentage',
    'numeric',
    'form_data.activity_subtype_data.ShorelineTypes[1].percent_covered'
  )
    .valueRange(0, 100)
    .build()
];

export const ShorelineSumValidator = SummingValidator(
  ['Shoreline - Shoreline 1 Percentage', 'Shoreline - Shoreline 2 Percentage'],
  100,
  'Shoreline % must sum to 100'
);

export const WaterbodyInformation = [
  new TemplateColumnBuilder(
    'Waterbody - Type',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.waterbody_type'
  )
    .isRequired()
    .referencesCode('shoreline_type_code')
    .build(),
  new TemplateColumnBuilder(
    'Waterbody - Tidal?',
    'tristate',
    'form_data.activity_subtype_data.WaterbodyData.tidal_influence'
  ).build(),
  new TemplateColumnBuilder(
    'Waterbody - Name',
    'text',
    'form_data.activity_subtype_data.WaterbodyData.waterbody_name_local'
  ).build(),
  new TemplateColumnBuilder(
    'Waterbody - Name Gazetted',
    'text',
    'form_data.activity_subtype_data.WaterbodyData.waterbody_name_gazetted'
  ).build(),

  new TemplateColumnBuilder(
    'Waterbody - Water Level Management',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.water_level_management'
  ).build(),

  new TemplateColumnBuilder(
    'Waterbody - Use',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.waterbody_use'
  )
    .referencesCode('waterbody_use_code')
    .build(),
  new TemplateColumnBuilder(
    'Waterbody - Adjacent Land Usage',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.adjacent_land_use'
  )
    .referencesCode('adjacent_land_use_code')
    .build(),
  new TemplateColumnBuilder(
    'Waterbody - Substrate',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.substrate_type'
  )
    .referencesCode('surface_substrate_code')
    .build(),

  new TemplateColumnBuilder(
    'Waterbody - Inflow - Permanent',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.inflow_permanent'
  )
    .referencesCode('inflow_permanent_code')
    .build(),
  new TemplateColumnBuilder(
    'Waterbody - Inflow - Other',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.inflow_other'
  )
    .referencesCode('inflow_temporary_code')
    .build(),

  new TemplateColumnBuilder(
    'Waterbody - Outflow - Permanent',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.outflow'
  )
    .referencesCode('outflow_code')
    .build(),
  new TemplateColumnBuilder(
    'Waterbody - Outflow - Seasonal',
    'codeReference',
    'form_data.activity_subtype_data.WaterbodyData.outflow_other'
  )
    .referencesCode('outflow_code')
    .build(),

  new TemplateColumnBuilder(
    'Waterbody - Access',
    'text',
    'form_data.activity_subtype_data.WaterbodyData.waterbody_access'
  ).build(),
  new TemplateColumnBuilder(
    'Waterbody - Comment',
    'text',
    'form_data.activity_subtype_data.WaterbodyData.comment'
  ).build()
];

export const WaterQualityInformation = [
  new TemplateColumnBuilder(
    'Water - Max Depth',
    'numeric',
    'form_data.activity_subtype_data.WaterQuality.water_sample_depth'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Water - Secchi Depth',
    'numeric',
    'form_data.activity_subtype_data.WaterQuality.secchi_depth'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),
  new TemplateColumnBuilder('Water - Colour', 'text', 'form_data.activity_subtype_data.water_colour')
    .isRequired()
    .build()
];

export const PhenologyInformation = [
  new TemplateColumnBuilder(
    'Phenology - Details Recorded?',
    'boolean',
    'form_data.activity_subtype_data.Target_Plant_Phenology.phenology_details_recorded'
  ).build(),
  new TemplateColumnBuilder(
    'Phenology - Target Height',
    'numeric',
    'form_data.activity_subtype_data.Target_Plant_Phenology.target_plant_heights[0]'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Phenology - Bolts',
    'numeric',
    'form_data.activity_subtype_data.Target_Plant_Phenology.bolts'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Phenology - Rosettes',
    'numeric',
    'form_data.activity_subtype_data.Target_Plant_Phenology.rosettes'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Phenology - Flowering',
    'numeric',
    'form_data.activity_subtype_data.Target_Plant_Phenology.flowering'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Phenology - Seedlings',
    'numeric',
    'form_data.activity_subtype_data.Target_Plant_Phenology.seedlings'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Phenology - Senescent',
    'numeric',
    'form_data.activity_subtype_data.Target_Plant_Phenology.senescent'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Phenology - Seeds Forming',
    'numeric',
    'form_data.activity_subtype_data.Target_Plant_Phenology.seeds_forming'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Phenology - Winter Dormant',
    'numeric',
    'form_data.activity_subtype_data.Target_Plant_Phenology.winter_dormant'
  )
    .valueRange(0, null)
    .build()
];

export const PhenologySumValidator = (row) => {
  const rowData = row.data;
  if (rowData?.['Phenology - Details Recorded?']?.parsedValue) {
    return SummingValidator(
      [
        'Phenology - Rosettes',
        'Phenology - Flowering',
        'Phenology - Seedlings',
        'Phenology - Senescent',
        'Phenology - Seeds Forming',
        'Phenology - Winter Dormant'
      ],
      100,
      'When phenology details are recorded, % values must sum to 100'
    )(row);
  }
};

export const ChemicalPlantTreatmentInformation = [
  new TemplateColumnBuilder(
    'Chemical Treatment - Service License',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.pesticide_employer_code'
  )
    .isRequired()
    .referencesCode('service_license_code')
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - PUP',
    'text',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.pesticide_use_permit_PUP'
  ).build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - PMP',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.pest_management_plan'
  )
    .referencesCode('pest_management_plan')
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - PMP Unlisted',
    'text',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.pmp_not_in_dropdown'
  ).build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Temperature',
    'numeric',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.temperature'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Wind Speed',
    'numeric',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.wind_speed'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Wind Direction',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.wind_direction_code'
  )
    .hardcodedCodes(WIND_DIRECTION_CODES)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Humidity',
    'numeric',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.humidity'
  ).build(),

  new TemplateColumnBuilder(
    'Chemical Treatment - Treatment Notice Signs',
    'tristate',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.signage_on_site'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Precautionary Statement',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.signage_on_site'
  )
    .referencesCode('precautionary_statement_code')
    .build(),

  new TemplateColumnBuilder(
    'Chemical Treatment - NTZ Reduction',
    'boolean',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.ntz_reduction'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - NTZ Reduction Rationale',
    'text',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.rationale_for_ntz_reduction'
  ).build(),

  new TemplateColumnBuilder(
    'Chemical Treatment - Start Time',
    'datetime',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.application_start_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Chemical Treatment - Unmapped Wells?',
    'boolean',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.unmapped_wells'
  )
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Chemical Treatment - Pest Injury Threshold Determination Done?',
    'boolean',
    'form_data.activity_subtype_data.Pest_Injury_Threshold_Determination.completed_radio'
  )
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Chemical Treatment (If Tank Mix) - Application Method',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.chemical_application_method'
  )
    .referencesCode('chemical_method_spray')
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment (No Tank Mix) - Application Method',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.chemical_application_method'
  )
    .referencesCode('chemical_method_code')
    .build()
];

export const HerbicidesInformation = [
  new TemplateColumnBuilder(
    'Herbicide - Tank Mix?',
    'boolean',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix'
  )
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Herbicide - 1 - Type',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].herbicide_type_code'
  )
    .referencesCode('herbicide_type_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 1 - Herbicide',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].herbicide_code'
  )
    .referencesCode(['granular_herbicide_code', 'liquid_herbicide_code'])
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 1 - Calculation Type',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].calculation_type'
  )
    .referencesCode('calculation_type_code')
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 1 - Dilution - Dilution %',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].dilution'
  )
    .valueRange(0, 100)
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 1 - Area Treated (Dilution)',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[0].area_treated_sqm'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - Delivery Rate of Mix',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.delivery_rate_of_mix'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 1 - PAR - Production Application Rate',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[0].product_application_rate'
  )
    .valueRange(0, null)
    .build(),

  new TemplateColumnBuilder('Herbicide - 2 - Type', 'codeReference').referencesCode('herbicide_type_code').build(),
  new TemplateColumnBuilder('Herbicide - 2 - Herbicide', 'codeReference')
    .referencesCode(['granular_herbicide_code', 'liquid_herbicide_code'])
    .build(),
  new TemplateColumnBuilder('Herbicide - 2 - Calculation Type', 'codeReference')
    .referencesCode('calculation_type_code')
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 2 - PAR - Production Application Rate',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[1].product_application_rate'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder('Herbicide - 2 - Dilution - Dilution %', 'numeric').valueRange(0, 100).build(),

  new TemplateColumnBuilder('Herbicide - 2 - Area Treated (Dilution)', 'numeric').valueRange(0, null).build(),
  new TemplateColumnBuilder(
    'Herbicide - Amount of Mix Used',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.amount_of_mix'
  )
    .valueRange(0, null)
    .build()
];