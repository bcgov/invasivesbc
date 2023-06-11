export interface POI_IAPP_Row {
  site_id: number;
  date_modified: string;
}

export const point_of_interest_iapp_default_headers = [
  {
    key: 'point_of_interest_id',
    name: 'Site ID'
  },
  {
    key: 'paper_file_id',
    name: 'Site Paper File ID'
  },
  {
    key: 'jurisdictions',
    name: 'Jurisdictions'
  },
  {
    key: 'date_created',
    name: 'Site Create Date'
  },
  {
    key: 'species_on_site',
    name: 'Invasive Plants'
  },
  {
    key: 'date_last_surveyed',
    name: 'Last Surveyed Date'
  },
  {
    key: 'agencies',
    name: 'Agencies'
  },
  {
    key: 'bio_release',
    name: 'Biocontrol Release'
  },
  {
    key: 'chem_treatment',
    name: 'Chemical Treatment'
  },
  {
    key: 'mech_treatment',
    name: 'Mechanical Treatment'
  },
  {
    key: 'bio_dispersal',
    name: 'Biocontrol Dispersal'
  },
  {
    key: 'monitored',
    name: 'Monitored'
  },
  {
    key: 'regional_district',
    name: 'Regional District'
  },
  {
    key: 'regional_invasive_species_organization',
    name: 'Regional Invasive Species Organization'
  }
];

const checkIfTheresArray = (treatments: any) => {
  return treatments?.length ? 'Yes' : 'No';
};

export const mapPOI_IAPP_ToDataGridRows = (activities) => {
  if (!activities) {
    return [];
  }
  if (activities.code) {
    return [];
  }

  return activities?.map((record, index) => {
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

    return {
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
  });
};
