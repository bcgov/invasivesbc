export const chemicalTreatmentJSON = (treatment: any) => {
  return {
    dilution: treatment.dilution_percent, // find dilution amount???
    employer: treatment.employer,
    humidity: null, // Could not find
    map_code: treatment.invasive_plant, // convert to code
    monitoring: [], // Could not find
    pup_number: treatment.pup_number,
    wind_speed: null, // Could not find
    common_name: treatment.invasive_plant, // use common name
    tank_mix_id: null, // Could not find tank mix id
    temperature: null, // Could not find tempurature
    project_code: [
      treatment.treatment_paper_file_id // What is the difference between site_paper_file_id
    ], //  and treatment_paper_file_id????
    treatment_id: treatment.chemicaltreatmentid,
    reported_area: treatment.area_treated, // area of POI or treated area??????
    treatment_date: treatment.treatment_date,
    treatment_time: null, // Could not find: no treatment time; just the date
    wind_direction: null, // Could not find: no wind direction
    chemical_method: treatment.method,
    general_comment: treatment.treatment_comments,
    pmra_reg_number: null, // Could not find: Primary Aplicator??????
    application_rate: treatment.application_rate,
    herbicide_amount: treatment.amount_of_undiluted_herbicide_used, // find herbicide amount
    mix_delivery_rate: treatment.delivery_rate,
    chemical_method_code: treatment.method, // convert to code
    herbicide_description: treatment.treatment_comments, // I believe this is what it should be???? COuld be wrong
    liquid_herbicide_code: null, // Could not find: NO liquid herbicide code int chemical_treatment_extracts
    service_licence_number: treatment.service_licence_number,
    pmp_confirmation_number: treatment.pmp_number,
    invasive_species_agency_code: treatment.treatment_agency
  };
};

export const biologicalDispersalJSON = (dispersal: any) => {
  return {
    map_code: dispersal.invasive_plant, // convert to map code (XX)
    utm_zone: dispersal.utm_zone,
    agent_count: null,
    common_name: dispersal.invasive_plant, // use common name
    plant_count: dispersal.density,
    utm_easting: dispersal.utm_easting,
    project_code: [dispersal.dispersal_paper_file_id],
    utm_northing: dispersal.utm_northing,
    monitoring_id: dispersal.biologicaldispersalid, // What is this??? (used dispersal id)
    count_duration: null, // Could not find or don't know what it means
    general_comment: dispersal.site_comments,
    monitoring_date: dispersal.inspection_date,
    eggs_present_ind: dispersal.eggs_present,
    pupae_present_ind: dispersal.pupea_present,
    adults_present_ind: dispersal.adults_present,
    larvae_present_ind: dispersal.larvae_present,
    invasive_plant_code: dispersal.invasive_plant, // convert to code (XXX)
    tunnels_present_ind: dispersal.tunnels_present,
    biological_agent_code: dispersal.biological_agent,
    oviposition_marks_ind: dispersal.oviposition_marks,
    biological_dispersal_id: dispersal.biologicaldispersalid,
    root_feeding_damage_ind: dispersal.rootfeeding_damage,
    seed_feeding_damage_ind: dispersal.seedfeeding_damage,
    foliar_feeding_damage_ind: dispersal.foliar_feeding_damage,
    invasive_species_agency_code: dispersal.dispersal_agency // convert to code
  };
};

export const biologicalTreatmentsJSON = (treatment: any) => {
  return {
    map_code: treatment.invasive_plant, // convert to code (XX)
    utm_zone: treatment.utm_zone,
    monitoring: [],
    common_name: treatment.invasive_plant, // use common name
    utm_easting: treatment.utm_easting,
    agent_source: treatment.bioagent_source,
    project_code: [treatment.treatment_paper_file_id],
    treatment_id: treatment.biotreatmentid,
    utm_northing: treatment.utm_northing,
    stage_egg_ind: null,
    stage_pupa_ind: null,
    treatment_date: treatment.treatment_date,
    collection_date: null, // could not find
    general_comment: treatment.treatment_comments,
    stage_larva_ind: null, // could not find
    stage_other_ind: null, // could not find
    release_quantity: treatment.release_quantity,
    classified_area_code: null, // could not find
    biological_agent_code: treatment.biological_agent,
    biological_agent_stage_code: null,
    invasive_species_agency_code: treatment.treatment_agency // convert to code
  };
};

export const mechanicalTreatmenntsJSON = (treatment: any) => {
  return {
    employer: treatment.employer,
    map_code: treatment.invasive_plant, // convert to code (XX)
    monitoring: [],
    common_name: treatment.invasive_plant, // use common name
    project_code: [treatment.treatment_paper_file_id],
    treatment_id: treatment.mechanicaltreatmentid,
    mechanical_id: treatment.mechanicaltreatmentid, // what is this supposed to be???? different id??
    reported_area: null,
    treatment_date: treatment.treatment_date,
    general_comment: treatment.treatment_comments,
    mechanical_method: treatment.treatment_method,
    mechanical_method_code: treatment.treatment_method, // convert to code
    invasive_species_agency_code: treatment.treatment_agency
  };
};
