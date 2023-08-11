import { ActivitySubtypeShortLabels } from "sharedAPI/src/constants";


export const getUnnestedFieldsForActivity = (activity) =>  {
    const getArrayString = (inputArray: [], subProp?) => {
      let output = ''
      if (subProp) {
        inputArray.map((item, index) => {
          if (item?.[subProp]) {
            output += item?.[subProp];
            if (index < inputArray.length - 1) output += ', ';
          }
        })
      } else {
        inputArray.map((item) => {
          output += ', ' + item
        })
      }
      return output
    }

    //console.dir(activity)
    console.log(activity?.activity_type)
    let columns: any = {
      // id: index,
      activity_id: activity?.activity_id,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_type,
      subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      activity_date: new Date(activity?.activity_payload?.form_data?.activity_data?.activity_date_time).toString(),
      project_code: getArrayString(Array.isArray(activity?.activity_payload?.form_data?.activity_data?.project_code) ? activity?.activity_payload?.form_data?.activity_data?.project_code : [], 'description'),
      jurisdiction: activity?.jurisdiction_display,
      species_positive: activity?.species_positive_full,
      species_negative: activity?.species_negative_full,
      has_current_positive: activity?.has_current_positive ? 'Yes' : 'No',
      current_positive: activity?.current_positive_species,
      has_current_negative: activity?.has_current_negative ? 'Yes' : 'No',
      current_negative: activity?.current_negative_species,
      species_treated: activity?.species_treated_full,
      created_by: activity?.created_by,
      updated_by: activity?.updated_by,
      agency: activity?.agency,
      regional_invasive_species_organization_areas: activity?.regional_invasive_species_organization_areas,
      regional_districts: activity?.regional_districts,
      biogeoclimatic_zones: activity?.biogeoclimatic_zones,
      elevation: activity?.elevation,
      batch_id: activity?.batch_id
      // date_modified: new Date(activity?.activity_payload?.created_timestamp).toString(),
      // reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      // latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      // longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
    }

    console.log(columns?.type)
    return JSON.parse(JSON.stringify(columns))
};

export const getUnnestedFieldsForIAPP = (record) => {
  const checkIfTheresArray = (treatments: any) => {
    return treatments?.length ? 'Yes' : 'No';
  };

  let agencies = new Set();
  let species = new Set();
  let lastSurveyed = new Date(record?.point_of_interest_payload?.form_data?.point_of_interest_data?.date_created);
  const jurisdictions = record?.point_of_interest_payload?.jurisdictions;
  const surveys = record?.point_of_interest_payload?.form_data?.surveys;
  const regional_district = record?.point_of_interest_payload?.regional_district;
  const regional_invasive_species_organization =
    record?.point_of_interest_payload?.regional_invasive_species_organization;

  // releases and dispersals
  const bioRelease = checkIfTheresArray(record?.point_of_interest_payload?.form_data?.biological_treatments);
  const chemTreatment = checkIfTheresArray(record?.point_of_interest_payload?.form_data?.chemical_treatments);
  const mechTreatment = checkIfTheresArray(record?.point_of_interest_payload?.form_data?.mechanical_treatments);
  const bioDispersal = checkIfTheresArray(record?.point_of_interest_payload?.form_data?.biological_dispersals);
  const monitored = record?.point_of_interest_payload?.form_data?.monitored;

  if (surveys?.length > 0) {
    for (const survey of surveys) {
      const survey_date = new Date(survey?.survey_date);

      // last survey date
      if (survey_date > lastSurveyed) lastSurveyed = survey_date;

      // agency
      agencies.add(survey?.invasive_species_agency_code);

      // species
      species.add(survey?.species);
    }
  }

  let columns: any = {
    point_of_interest_id: record?.point_of_interest_id?.toString(),
    paper_file_id: record?.point_of_interest_payload?.form_data?.point_of_interest_data?.project_code[0]?.description,
    jurisdictions: jurisdictions ? jurisdictions?.sort().join(', ') : null,
    date_created: record?.point_of_interest_payload?.date_created
      ? new Date(record?.point_of_interest_payload?.date_created).toISOString().substring(0, 10)
      : null,
    species_on_site: species.size > 0 ? Array.from(species).sort().join(', ') : null,
    date_last_surveyed: !isNaN(lastSurveyed as any) ? lastSurveyed?.toISOString().substring(0, 10) : null,
    agencies: agencies?.size > 0 ? Array.from(agencies).sort().join(', ') : null,
    bio_release: bioRelease,
    chem_treatment: chemTreatment,
    mech_treatment: mechTreatment,
    bio_dispersal: bioDispersal,
    monitored: monitored,
    regional_district: regional_district,
    regional_invasive_species_organization: regional_invasive_species_organization
  };

  return JSON.parse(JSON.stringify(columns));
};