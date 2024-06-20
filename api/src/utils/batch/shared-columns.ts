import { TemplateColumnBuilder } from './definitions';
import { RowValidationResult } from './validation/validation';
import {
  WATER_LEVEL_MANAGEMENT_CODES,
  WIND_DIRECTION_CODES,
  WATERBODY_TYPE_CODES,
  SUBSTRATE_TYPE_CODES,
  YES_NO_CODES
} from './hard-coded-codes';

export const BasicInformation = [
  new TemplateColumnBuilder('WKT', 'WKT', {
    geojson: 'geometry',
    geog: 'geog',
    area: 'form_data.activity_data.reported_area',
    latitude: 'form_data.activity_data.latitude',
    longitude: 'form_data.activity_data.longitude',
    utm_zone: 'form_data.activity_data.utm_zone',
    utm_northing: 'form_data.activity_data.utm_northing',
    utm_easting: 'form_data.activity_data.utm_easting'
  })
    .isRequired()
    .build(),
  new TemplateColumnBuilder('Basic - Date', 'datetime', 'form_data.activity_data.activity_date_time')
    .isRequired()
    .mustNotBeFuture()
    .mapperOverwritesPrevious()
    .build(),
  new TemplateColumnBuilder('Basic - Employer', 'codeReference', 'form_data.activity_data.employer_code')
    .isRequired()
    .referencesCode('employer_code')
    .build(),
  new TemplateColumnBuilder(
    'Basic - Funding Agency 1',
    'codeReference',
    'form_data.activity_data.invasive_species_agency_code[0]'
  )
    .referencesCode('invasive_species_agency_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Basic - Funding Agency 2',
    'codeReference',
    'form_data.activity_data.invasive_species_agency_code[1]'
  )
    .referencesCode('invasive_species_agency_code')
    .build(),
  new TemplateColumnBuilder(
    'Basic - Funding Agency 3',
    'codeReference',
    'form_data.activity_data.invasive_species_agency_code[2]'
  )
    .referencesCode('invasive_species_agency_code')
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
    .valueRange(1, 100)
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
    .valueRange(1, 100)
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
    .valueRange(1, 100)
    .build(),
  new TemplateColumnBuilder('Basic - Location Description', 'text', 'form_data.activity_data.location_description')
    .isRequired()
    .lengthRange(5, 2000)
    .build(),
  new TemplateColumnBuilder('Basic - Access Description', 'text', 'form_data.activity_data.access_description')
    .lengthRange(0, 2000)
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

export const AccessDescriptionLengthValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Basic - Access Description'];
  const rowData = row.data;
  const validationMessages = [];

  if (rowData?.['Basic - Access Description']?.parsedValue) {
    const accessDescription = rowData['Basic - Access Description'].parsedValue;

    if (accessDescription.length < 5) {
      valid = false;
      validationMessages.push({
        severity: 'error',
        messageTitle: 'Too few characters',
        messageDetail: 'Minimum characters is 5.'
      });
    }
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const JurisdictionValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Basic - Jurisdiction 2', 'Basic - Jurisdiction 3'];
  const rowData = row.data;
  const jurisdiction_two = rowData?.['Basic - Jurisdiction 2']?.parsedValue;
  const jurisdiction_three = rowData?.['Basic - Jurisdiction 3']?.parsedValue;
  const validationMessages = [];

  if (jurisdiction_three && !jurisdiction_two) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'If Jurisdiction 2 is not entered, Jurisdiction 3 must be blank.'
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const BasicInformationRowValidators = [
  _JurisdictionSumValidator,
  LinkedRecordsValidator(['Basic - Jurisdiction 2', 'Basic - Jurisdiction 2 % Covered']),
  LinkedRecordsValidator(['Basic - Jurisdiction 3', 'Basic - Jurisdiction 3 % Covered']),
  AccessDescriptionLengthValidator,
  JurisdictionValidator
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
    .mapperOverwritesPrevious()
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
  new TemplateColumnBuilder('Project - Code 1', 'text', 'form_data.activity_data.project_code[0].description').build(),
  new TemplateColumnBuilder('Project - Code 2', 'text', 'form_data.activity_data.project_code[1].description').build(),
  new TemplateColumnBuilder('General Comment', 'text', 'form_data.activity_data.general_comment').build()
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
    'Weather - Wind Direction',
    'codeReference',
    'form_data.activity_subtype_data.Weather_Conditions.wind_direction_code'
  )
    .hardcodedCodes(WIND_DIRECTION_CODES)
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
  )
    .referencesCode('site_surface_shape_code')
    .build()
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

export const AuthorizationInformation = [
  new TemplateColumnBuilder(
    'Authorization Information',
    'text',
    'form_data.activity_subtype_data.authorization_infotmation.additional_auth_information'
  ).build()
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
    .hardcodedCodes(WATERBODY_TYPE_CODES)
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
  )
    .hardcodedCodes(WATER_LEVEL_MANAGEMENT_CODES)
    .build(),

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
    .isRequired()
    .hardcodedCodes(SUBSTRATE_TYPE_CODES)
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
    .build(),
  new TemplateColumnBuilder(
    'Water - Secchi Depth',
    'numeric',
    'form_data.activity_subtype_data.WaterQuality.secchi_depth'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Water - Colour',
    'text',
    'form_data.activity_subtype_data.WaterQuality.water_colour'
  ).build()
];

export const PhenologyInformation = [
  new TemplateColumnBuilder(
    'Phenology - Details Recorded?',
    'codeReference',
    'form_data.activity_subtype_data.Target_Plant_Phenology.phenology_details_recorded'
  )
    .isRequired()
    .hardcodedCodes(YES_NO_CODES)
    .build(),
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

export const PhenologySumValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = [
    'Phenology - Bolts',
    'Phenology - Rosettes',
    'Phenology - Flowering',
    'Phenology - Seedlings',
    'Phenology - Senescent',
    'Phenology - Seeds Forming',
    'Phenology - Winter Dormant'
  ];
  const rowData = row.data;
  const detailsRecorded = rowData?.['Phenology - Details Recorded?']?.parsedValue;
  let sum = 0;
  const validationMessages = [];

  if (detailsRecorded === 'Yes') {
    for (const f of fields) {
      if (rowData?.[f]?.parsedValue !== null && !isNaN(rowData?.[f]?.parsedValue)) {
        sum += rowData?.[f]?.parsedValue;
      }
    }
    if (sum !== 100) {
      valid = false;
      validationMessages.push({
        severity: 'error',
        messageTitle: 'Sum must equal 100',
        messageDetail: `'Actual sum: ${sum} != 100`
      });
    } else {
      valid = true;
    }
  }
  if (detailsRecorded === 'No') {
    const targetHeight = rowData?.['Phenology - Target Height']?.parsedValue;
    let allFieldsNull = true;

    for (const f of [...fields, targetHeight]) {
      if (rowData?.[f]?.parsedValue) {
        valid = false;
        validationMessages.push({
          severity: 'error',
          messageTitle: 'Not required',
          messageDetail: `Phenology details must be blank when Phenology - Details Recorded? is 'No'`
        });
        allFieldsNull = false;
        break;
      }
    }

    if (allFieldsNull) {
      valid = true;
    }
  }

  return {
    valid,
    validationMessages,
    appliesToFields: detailsRecorded === 'No' ? [...fields, 'Phenology - Target Height'] : fields
  };
};

export const PositiveObservationPlantValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Observation - Life Stage', 'Observation - Distribution', 'Observation - Density'];
  const rowData = row.data;
  const validationMessages = [];
  if (rowData?.['Observation - Type']?.parsedValue === 'Positive Observation') {
    // if it was a positive occurrence, three other fields become required

    for (const v of fields) {
      if (!rowData?.[v]?.parsedValue) {
        valid = false;
        validationMessages.push({
          severity: 'error',
          messageTitle: 'Required value',
          messageDetail: `${v} is required when Observation - Type is Positive Observation`
        });
      }
    }
  }

  if (rowData?.['Observation - Type']?.parsedValue === 'Negative Observation') {
    for (const v of fields) {
      if (rowData?.[v]?.parsedValue) {
        valid = false;
        validationMessages.push({
          severity: 'error',
          messageTitle: 'Invalid value',
          messageDetail: `${v} must be blank when Observation - Type is Negative Observation`
        });
      }
    }
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const SlopeAspectValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Observation - Terrestrial - Aspect', 'Observation - Terrestrial - Slope'];
  const rowData = row.data;
  const aspect = rowData?.['Observation - Terrestrial - Aspect']?.parsedValue;
  const slope = rowData?.['Observation - Terrestrial - Slope']?.parsedValue;
  const validationMessages = [];

  if ((aspect === 'FL' && slope !== 'FL') || (slope === 'FL' && aspect !== 'FL')) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'If either Aspect or Slope is Flat, both must be Flat.'
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const PmpValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Chemical Treatment - PMP', 'Chemical Treatment - PMP Unlisted'];
  const rowData = row.data;
  const pmp = rowData?.['Chemical Treatment - PMP']?.parsedValue;
  const pmp_unlisted = rowData?.['Chemical Treatment - PMP Unlisted']?.parsedValue;
  const validationMessages = [];

  if (!pmp && !pmp_unlisted) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'Either PMP or PMP Unlisted is required.'
    });
  }

  if (pmp && pmp_unlisted) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'Only 1 of PMP or PMP Unlisted is required.'
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const WindDirectionValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Chemical Treatment - Wind Speed', 'Chemical Treatment - Wind Direction'];
  const rowData = row.data;
  const wind_speed = rowData?.['Chemical Treatment - Wind Speed']?.parsedValue;
  const wind_direction = rowData?.['Chemical Treatment - Wind Direction']?.parsedValue;
  const validationMessages = [];

  if (wind_speed === 0 && wind_direction !== 'No Wind') {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'If Wind Speed is 0, Wind Direction must be No Wind.'
    });
  }

  if (wind_direction === 'No Wind' && wind_speed > 0) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'If Wind Direction is No Wind, Wind Speed must be 0.'
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const ApplicationMethodValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = [
    'Chemical Treatment (If Tank Mix) - Application Method',
    'Chemical Treatment (No Tank Mix) - Application Method'
  ];
  const rowData = row.data;
  const tank_mix_application = rowData?.['Chemical Treatment (If Tank Mix) - Application Method']?.parsedValue;
  const no_tank_mix_application = rowData?.['Chemical Treatment (No Tank Mix) - Application Method']?.parsedValue;
  const validationMessages = [];

  if (!tank_mix_application && !no_tank_mix_application) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail:
        'Either Chemical Treatment (If Tank Mix) - Application Method or Chemical Treatment (No Tank Mix) - Application Method is required.'
    });
  }

  if (tank_mix_application && no_tank_mix_application) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'Only 1 application method is required.'
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const GranularHerbicideRate = (row): RowValidationResult => {
  let valid = true;
  const fields = [
    'Herbicide - 1 - Type',
    'Herbicide - 1 - PAR - Production Application Rate',
    'Herbicide - 2 - Type',
    'Herbicide - 2 - PAR - Production Application Rate',
    'Herbicide - 3 - Type',
    'Herbicide - 3 - PAR - Production Application Rate'
  ];
  const rowData = row.data;
  const validationMessages = [];

  // Check herbicide type and application rate
  for (let i = 1; i <= 3; i++) {
    const herbicideType = rowData[`Herbicide - ${i} - Type`]?.parsedValue;
    const applicationRate = rowData[`Herbicide - ${i} - PAR - Production Application Rate`]?.parsedValue;

    if (herbicideType === 'G' && applicationRate < 10) {
      valid = false;
      validationMessages.push({
        severity: 'error',
        messageTitle: 'Invalid value',
        messageDetail: `Herbicide - ${i} - PAR - Production Application Rate must be >= 10 for granular herbicide.`
      });
    }
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const ApplicationMethodType = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Chemical Treatment (No Tank Mix) - Application Method', 'Chemical Treatment - Calculation Type'];
  const rowData = row.data;
  const validationMessages = [];

  const applicationMethod = rowData[`Chemical Treatment (No Tank Mix) - Application Method`]?.parsedValue;
  const applicationMethodFriendly = rowData[`Chemical Treatment (No Tank Mix) - Application Method`]?.friendlyValue;
  const calculationType = rowData[`Chemical Treatment - Calculation Type`]?.parsedValue;
  const herbicideType = rowData[`Herbicide - 1 - Type`]?.parsedValue;
  const directMethods = ['BBA', 'CIN', 'CSP', 'SIN', 'WCK'];

  if (directMethods.includes(applicationMethod) && calculationType === 'PAR') {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: `Calculation Type must be Dilution when Application Method is ${applicationMethodFriendly}.`
    });
  }

  if (directMethods.includes(applicationMethod) && herbicideType === 'G') {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: `Herbicide Type must be Liquid when Application Method is ${applicationMethodFriendly}.`
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const BioAgentValidator = (row): RowValidationResult => {
  let valid = true;
  const rowData = row.data;
  const biocontrolPresent = rowData['Monitoring - Biocontrol Present']?.parsedValue;
  const validationMessages = [];
  let appliesToFields = [];
  let actualFields = [];
  let estimatedFields = [];

  if (rowData['Monitoring - Actual - Agent Stage']) {
    actualFields = [
      'Monitoring - Actual - Agent Stage',
      'Monitoring - Actual - Quantity',
      'Monitoring - Actual - Plant Position',
      'Monitoring - Actual - Agent Location'
    ];

    estimatedFields = [
      'Monitoring - Estimated - Agent Stage',
      'Monitoring - Estimated - Quantity',
      'Monitoring - Estimated - Plant Position',
      'Monitoring - Estimated - Agent Location'
    ];
  }

  if (rowData['Release - Actual - Agent Stage']) {
    actualFields = ['Release - Actual - Agent Stage', 'Release - Actual - Quantity'];
    estimatedFields = ['Release - Estimated - Agent Stage', 'Release - Estimated - Quantity'];
  }

  if (rowData['Collection - Actual - Agent Stage']) {
    actualFields = ['Collection - Actual - Agent Stage', 'Collection - Actual - Quantity'];
    estimatedFields = ['Collection - Estimated - Agent Stage', 'Collection - Estimated - Quantity'];
  }

  const allFieldsHaveData = (fields) => fields.every((field) => rowData[field]?.parsedValue);

  const anyFieldHasData = (fields) => fields.some((field) => rowData[field]?.parsedValue);

  const missingFields = (fields) => fields.filter((field) => !rowData[field]?.parsedValue);

  const filledFields = (fields) => fields.filter((field) => rowData[field]?.parsedValue);

  if (anyFieldHasData(actualFields) && (biocontrolPresent === true || !rowData['Monitoring - Biocontrol Present'])) {
    if (!allFieldsHaveData(actualFields)) {
      valid = false;
      const missingActualFields = missingFields(actualFields);
      appliesToFields.push(...missingActualFields);
      validationMessages.push({
        severity: 'error',
        messageTitle: 'Field missing data',
        messageDetail: `If any Actual bioagent field has data then all Actual bioagent fields must have data.`
      });
    }
  }

  if (anyFieldHasData(estimatedFields) && (biocontrolPresent === true || !rowData['Monitoring - Biocontrol Present'])) {
    if (!allFieldsHaveData(estimatedFields)) {
      valid = false;
      const missingEstimatedFields = missingFields(estimatedFields);
      appliesToFields.push(...missingEstimatedFields);
      validationMessages.push({
        severity: 'error',
        messageTitle: 'Field missing data',
        messageDetail: `If any Estimated bioagent field has data then all Estimated bioagent fields must have data.`
      });
    }
  }

  if (
    !anyFieldHasData(actualFields) &&
    !anyFieldHasData(estimatedFields) &&
    (!rowData['Monitoring - Biocontrol Present'] || biocontrolPresent === true)
  ) {
    valid = false;
    appliesToFields.push(...actualFields, ...estimatedFields);
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Fields missing data',
      messageDetail: `Either Actual or Estimated bioagent info must be entered.`
    });
  }

  if (
    allFieldsHaveData(actualFields) &&
    allFieldsHaveData(estimatedFields) &&
    (!rowData['Monitoring - Biocontrol Present'] || biocontrolPresent === true)
  ) {
    valid = false;
    const filledActualFields = filledFields(actualFields);
    const filledEstimatedFields = filledFields(estimatedFields);
    appliesToFields.push(...filledActualFields, ...filledEstimatedFields);
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Conflicting data',
      messageDetail: `Only 1 of Actual or Estimated bioagent info must be entered.`
    });
  }

  if (
    (anyFieldHasData(actualFields) && biocontrolPresent === false) ||
    (anyFieldHasData(estimatedFields) && biocontrolPresent === false)
  ) {
    valid = false;
    const filledActualFields = filledFields(actualFields);
    const filledEstimatedFields = filledFields(estimatedFields);
    appliesToFields.push(...filledActualFields, ...filledEstimatedFields);
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Conflicting data',
      messageDetail: `If Biocontrol Present is false Actual and Estimated bioagent info fields must be blank.`
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields
  };
};

export const SpreadResultsValidator = (row): RowValidationResult => {
  let valid = true;
  const rowData = row.data;
  const fields = [
    'Monitoring - Results - Spread - Plant Attack',
    'Monitoring - Results - Spread - Agent Density',
    'Monitoring - Results - Spread - Max Spread Aspect',
    'Monitoring - Results - Spread - Max Spread Distance'
  ];
  const spreadDetailsRecorded = rowData['Monitoring - Results - Spread - Recorded?']?.parsedValue;
  const validationMessages = [];
  let appliesToFields = [];

  const allFieldsHaveData = (fields) => fields.every((field) => rowData[field]?.parsedValue);

  const anyFieldHasData = (fields) => fields.some((field) => rowData[field]?.parsedValue);

  const missingFields = (fields) => fields.filter((field) => !rowData[field]?.parsedValue);

  const filledFields = (fields) => fields.filter((field) => rowData[field]?.parsedValue);

  if (anyFieldHasData(fields) && spreadDetailsRecorded === 'No') {
    valid = false;
    const fieldsWithData = filledFields(fields);
    appliesToFields.push(...fieldsWithData);
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Conflicting data',
      messageDetail: `If Monitoring - Results - Spread - Recorded? is 'No' Spread details must be blank.`
    });
  }

  if (!allFieldsHaveData(fields) && spreadDetailsRecorded === 'Yes') {
    valid = false;
    const fieldsWithoutData = missingFields(fields);
    appliesToFields.push(...fieldsWithoutData);
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Conflicting data',
      messageDetail: `If Monitoring - Results - Spread - Recorded? is 'Yes' Spread details must be entered.`
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields
  };
};

export const TreatmentEfficacyValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Monitoring - Evidence of Treatment', 'Monitoring - Treatment Efficacy Rating'];
  const rowData = row.data;
  const evidence_of_treatment = rowData?.['Monitoring - Evidence of Treatment']?.parsedValue;
  const treatment_efficacy = rowData?.['Monitoring - Treatment Efficacy Rating']?.parsedValue;
  const validationMessages = [];

  if (evidence_of_treatment === 'Yes' && !treatment_efficacy) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Missing value',
      messageDetail: 'If Evidence of Treatment is Yes, Treatment Efficacy Rating must not be blank.'
    });
  }

  if (evidence_of_treatment === 'No' && treatment_efficacy) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'If Evidence of Treatment is No, Treatment Efficacy Rating must be blank.'
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const TerrestrialAquaticPlantValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Monitoring - Terrestrial Invasive Plant', 'Monitoring - Aquatic Invasive Plant'];
  const rowData = row.data;
  const terrestrial_plant = rowData?.['Monitoring - Terrestrial Invasive Plant']?.parsedValue;
  const aquatic_plant = rowData?.['Monitoring - Aquatic Invasive Plant']?.parsedValue;
  const validationMessages = [];

  if (terrestrial_plant && aquatic_plant) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'Only one of Terrestrial Invasive Plant and Aquatic Invasive Plant must be entered.'
    });
  }

  if (!terrestrial_plant && !aquatic_plant) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'One of Terrestrial Invasive Plant and Aquatic Invasive Plant must be entered.'
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
};

export const CopyGeometryValidator = (row): RowValidationResult => {
  let valid = true;
  const fields = ['Monitoring - Linked Treatment ID', 'Monitoring - Copy Geometry'];
  const rowData = row.data;
  const linked_id = rowData?.['Monitoring - Linked Treatment ID']?.parsedValue;
  const copy_geometry = rowData?.['Monitoring - Copy Geometry']?.parsedValue;
  const validationMessages = [];

  if (copy_geometry === 'Yes' && !linked_id) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Missing value',
      messageDetail: 'If Copy Geometry is Yes, Linked Treatment ID must be entered.'
    });
  }

  if (copy_geometry === 'No' && linked_id) {
    valid = false;
    validationMessages.push({
      severity: 'error',
      messageTitle: 'Invalid value',
      messageDetail: 'If Copy Geometry is No, Linked Treatment ID must be blank.'
    });
  }

  return {
    valid,
    validationMessages,
    appliesToFields: fields
  };
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
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.precautionary_statement'
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
    'Chemical Treatment - Unmapped Wells?',
    'boolean',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.unmapped_wells'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Start Time',
    'datetime',
    'form_data.activity_subtype_data.Treatment_ChemicalPlant_Information.application_start_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Chemical Treatment - Pest Injury Threshold Determination Done?',
    'boolean',
    'form_data.activity_subtype_data.Pest_Injury_Threshold_Determination.completed_radio'
  )
    .isRequired()
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
    'Chemical Treatment - Calculation Type',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.calculation_type'
  )
    .referencesCode('calculation_type_code')
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
    'Herbicide - Amount of Mix Used',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.amount_of_mix'
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
    'Herbicide - 2 - Type',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[1].herbicide_type_code'
  )
    .referencesCode('herbicide_type_code')
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 2 - Herbicide',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[1].herbicide_code'
  )
    .referencesCode(['granular_herbicide_code', 'liquid_herbicide_code'])
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 2 - PAR - Production Application Rate',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[1].product_application_rate'
  )
    .valueRange(0, null)
    .build(),

  new TemplateColumnBuilder(
    'Herbicide - 3 - Type',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[2].herbicide_type_code'
  )
    .referencesCode('herbicide_type_code')
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 3 - Herbicide',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.herbicides[2].herbicide_code'
  )
    .referencesCode(['granular_herbicide_code', 'liquid_herbicide_code'])
    .build(),
  new TemplateColumnBuilder(
    'Herbicide - 3 - PAR - Production Application Rate',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.tank_mix_object.herbicides[2].product_application_rate'
  )
    .valueRange(0, null)
    .build()
];
