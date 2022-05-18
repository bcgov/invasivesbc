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

  return activities?.rows?.map((record, index) => {
    let lastSurveyed = new Date(record?.point_of_interest_payload?.form_data?.point_of_interest_data?.date_created);
    let agencies = new Set();
    let species = new Set();
    const jurisdictions = record?.point_of_interest_payload?.jurisdictions;

    // releases and dispersals
    const bioRelease = checkIfTheresArray(record?.point_of_interest_payload?.form_data?.biological_treatments);
    const chemTreatment = checkIfTheresArray(record?.point_of_interest_payload?.form_data?.chemical_treatments);
    const mechTreatment = checkIfTheresArray(record?.point_of_interest_payload?.form_data?.mechanical_treatments);
    const bioDispersal = checkIfTheresArray(record?.point_of_interest_payload?.form_data?.biological_dispersals);
    const monitored = record?.point_of_interest_payload?.form_data?.monitored;

    for (const survey of record?.point_of_interest_payload?.form_data?.surveys) {
      // last survey date
      const survey_date = new Date(survey?.survey_date);
      if (survey_date > lastSurveyed) lastSurveyed = survey_date;

      // agency
      agencies.add(survey?.invasive_species_agency_code);

      // species
      species.add(survey?.species);
    }

    const jurisdictions = record?.point_of_interest_payload?.jurisdictions;

    return {
      point_of_interest_id: record?.point_of_interest_id,
      paper_file_id: record?.point_of_interest_payload?.form_data?.point_of_interest_data?.project_code[0]?.description,
      jurisdictions: jurisdictions ? jurisdictions.join(', ') : null,
      date_created: new Date(record?.point_of_interest_payload?.form_data?.point_of_interest_data?.date_created)
        .toISOString()
        .substring(0, 10),
      species_on_site: Array.from(species).join(', '),
      date_last_surveyed: lastSurveyed.toISOString().substring(0, 10),
      agencies: Array.from(agencies).join(', '),
      bio_release: bioRelease,
      chem_treatment: chemTreatment,
      mech_treatment: mechTreatment,
      bio_dispersal: bioDispersal,
      monitored: monitored
    };
  });
};
