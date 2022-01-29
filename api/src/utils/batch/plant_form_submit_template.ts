'use strict';

export const PlantFormSubmissionFromData = (data) => {
  return {
    created_by: data.created_by,
    created_timestamp: data.created_timestamp,
    activity_id: data.activity_id,
    doc_type: 'activity',
    activity_type: 'Observation',
    activity_subtype: 'Activity_Observation_PlantTerrestrial',
    biogeoclimatic_zones: null,
    regional_invasive_species_organization_areas: null,
    invasive_plant_management_areas: null,
    ownership: null,
    regional_districts: null,
    flnro_districts: null,
    moti_districts: null,
    elevation: null,
    well_proximity: null,
    utm_zone: null,
    utm_northing: null,
    utm_easting: null,
    albers_northing: null,
    albers_easting: null,
    form_status: 'Not Validated',
    sync_status: 'Not Saved',
    review_status: 'Not Reviewed',
    geom: [],
    activity_payload: {
      status: 'Edited',
      version: null,
      geometry: [],
      form_data: {
        activity_data: {
          latitude: data.latitude,
          utm_zone: `${data.utm_zone}`,
          longitude: data.longitude,
          utm_easting: data.utm_easting,
          project_code: [
            {
              description: data.project_code
            }
          ],
          utm_northing: data.utm_northing,
          employer_code: `${data.employer_code}`,
          jurisdictions: data.jurisdictions.map((j) => ({
            percent_covered: j.percent_covered,
            jurisdiction_code: j.jurisdiction_code
          })),
          reported_area: 1,
          general_comment: `${data.general_comment}`,
          access_description: `${data.access_description}`,
          activity_date_time: `${data.activity_date_time}`,
          location_description: `${data.location_description}`,
          invasive_species_agency_code: `${data.invasive_species_agency_code}`
        },
        activity_type_data: {
          survey_type: 'data.survey_type',
          treatment_persons: [{}],
          observation_persons: [
            {
              person_name: data.observation_person_name
            }
          ],
          observation_type_code: data.observation_type_code
        },
        activity_subtype_data: {
          invasive_plants: [
            {
              occurrence: data.invasive_plants_occurrence,
              edna_sample: 'No',
              observation_type: data.invasive_plants_observation_type,
              invasive_plant_code: data.invasive_plants_code,
              plant_life_stage_code: data.invasive_plants_life_stage_code,
              edna_sample_information: {},
              voucher_specimen_collected: 'No',
              invasive_plant_density_code: data.invasive_plants_density_code,
              invasive_plant_distribution_code: data.invasive_plants_distribution_code,
              voucher_specimen_collection_information: null
            }
          ],
          observation_plant_terrestrial_data: {
            well_ind: `${data.observation_plant_terrestrial_data.well_ind}`,
            slope_code: `${data.observation_plant_terrestrial_data.slope_code}`,
            aspect_code: `${data.observation_plant_terrestrial_data.aspect_code}`,
            soil_texture_code: `${data.observation_plant_terrestrial_data.soil_texture_code}`,
            specific_use_code: `${data.observation_plant_terrestrial_data.specific_use_code}`,
            research_detection_ind: `${data.observation_plant_terrestrial_data.research_detection_ind}`
          }
        }
      }
    }
  };
};
