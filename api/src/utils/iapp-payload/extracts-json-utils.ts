import { mapTankMix } from './iapp-function-utils';

const mapEfficacyCode = (percent) => {
  percent = Number(percent);
  if (percent < 10) return 10;
  if (percent < 20) return 9;
  if (percent < 30) return 8;
  if (percent < 40) return 7;
  if (percent < 50) return 6;
  if (percent < 60) return 5;
  if (percent < 70) return 4;
  if (percent < 80) return 3;
  if (percent < 90) return 2;
  if (percent <= 100) return 1;
};

export const chemicalTreatmentJSON = (treatment: any, all_monitoring: any[]) => {
  const common_name = treatment.invasive_plant.substring(0, treatment.invasive_plant.indexOf('(') - 1);
  const monitoring = [];
  all_monitoring.forEach((item) => {
    if (treatment.treatment_date.valueOf() === item.treatment_date.valueOf()) {
      monitoring.push(monitoringJSON({ item: item, type: 'chemical' }));
    }
  });
  return {
    dilution: treatment.dilution_percent, // find dilution amount???
    employer: treatment.employer,
    humidity: null, // Could not find
    map_code: treatment.invasive_plant, // convert to code
    monitoring: monitoring.length > 0 ? monitoring : [], // Could not find
    pup_number: treatment.pup_number,
    wind_speed: null, // Could not find
    common_name: common_name, // use common name
    tank_mix_id: null, // Could not find tank mix id
    temperature: null, // Could not find tempurature
    project_code: [
      { description: treatment.treatment_paper_file_id } // What is the difference between site_paper_file_id
    ], //  and treatment_paper_file_id????
    treatment_id: treatment.chemicaltreatmentid,
    reported_area: treatment.area_treated_hectares, // area of POI or treated area??????
    treatment_date: treatment.treatment_date,
    treatment_time: null, // Could not find: no treatment time; just the date
    wind_direction: null, // Could not find: no wind direction
    chemical_method: treatment.method,
    general_comment: treatment.treatment_comments,
    primary_applicator: treatment.primary_applicator,
    pmra_reg_number: null, // Could not find: Primary Aplicator??????
    application_rate: treatment.application_rate_litres_per_hectare,
    amount_of_mix: treatment.amount_of_mix_used_litres,
    herbicide_amount: treatment.amount_of_undiluted_herbicide_used_litres, // find herbicide amount
    mix_delivery_rate: treatment.delivery_rate_litres_per_hectare,
    chemical_method_code: treatment.method, // convert to code
    herbicide_description: treatment.treatment_comments, // I believe this is what it should be???? COuld be wrong
    liquid_herbicide_code: null, // Could not find: NO liquid herbicide code int chemical_treatment_extracts
    herbicide: treatment.herbicide,
    service_licence_number: treatment.service_licence_number,
    tank_mix: mapTankMix(treatment.tank_mix),
    pmp_confirmation_number: treatment.pmp_number,
    invasive_species_agency_code: treatment.treatment_agency
  };
};

export const biologicalDispersalJSON = (dispersal: any) => {
  const leftBracket = dispersal.invasive_plant.indexOf('(');
  const common_name = dispersal.invasive_plant.substring(0, leftBracket - 1);
  const plant_code = dispersal.invasive_plant.substring(leftBracket + 5, dispersal.invasive_plant.length - 1);
  return {
    map_code: dispersal.invasive_plant, // convert to map code (XX)
    utm_zone: dispersal.utm_zone,
    monitoring: [],
    common_name: common_name, // use common name
    utm_easting: dispersal.utm_easting,
    project_code: [{ description: dispersal.dispersal_paper_file_id }],
    utm_northing: dispersal.utm_northing,
    monitoring_id: dispersal.biologicaldispersalid, // What is this??? (used dispersal id)
    general_comment: dispersal.site_comments,
    monitoring_date: dispersal.inspection_date,
    agent_count: dispersal.agent_count,
    plant_count: dispersal.plant_count,
    count_duration: dispersal.count_duration,
    eggs_present_ind: dispersal.eggs_present,
    pupae_present_ind: dispersal.pupae_present,
    adults_present_ind: dispersal.adults_present,
    larvae_present_ind: dispersal.larvae_present,
    invasive_plant_code: plant_code, // convert to code (XXX)
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

export const biologicalTreatmentsJSON = (treatment: any, all_monitoring: any[]) => {
  const common_name = treatment.invasive_plant.substring(0, treatment.invasive_plant.indexOf('(') - 1);
  const monitoring = [];
  all_monitoring.forEach((item) => {
    if (treatment.treatment_date.valueOf() === item.treatment_date.valueOf()) {
      monitoring.push(monitoringJSON({ item: item, type: 'biological' }));
    }
  });
  return {
    map_code: treatment.invasive_plant, // convert to code (XX)
    utm_zone: treatment.utm_zone,
    monitoring: monitoring.length > 0 ? monitoring : [],
    common_name: common_name, // use common name
    utm_easting: treatment.utm_easting,
    agent_source: treatment.bioagent_source,
    project_code: [{ description: treatment.treatment_paper_file_id }],
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
    invasive_species_agency_code: treatment.treatment_agency, // convert to code
    employer: treatment.employer,
    primary_applicator: treatment.primary_applicator
  };
};

export const mechanicalTreatmenntsJSON = (treatment: any, all_monitoring: any[]) => {
  const common_name = treatment.invasive_plant.substring(0, treatment.invasive_plant.indexOf('(') - 1);
  const monitoring = [];
  all_monitoring.forEach((item) => {
    if (treatment.treatment_date.valueOf() === item.treatment_date.valueOf()) {
      monitoring.push(monitoringJSON({ item: item, type: 'mechanical' }));
    }
  });
  return {
    employer: treatment.employer,
    map_code: treatment.invasive_plant, // convert to code (XX)
    monitoring: monitoring.length > 0 ? monitoring : [],
    common_name: common_name, // use common name
    project_code: [{ description: treatment.treatment_paper_file_id }],
    primary_applicator: treatment.primary_applicator,
    treatment_id: treatment.treatment_id,
    mechanical_id: treatment.mechanicaltreatmentid, // what is this supposed to be???? different id??
    reported_area: treatment.estimated_area_hectares,
    treatment_date: treatment.treatment_date,
    general_comment: treatment.treatment_comments,
    mechanical_method: treatment.method,
    mechanical_method_code: treatment.treatment_method, // convert to code
    invasive_species_agency_code: treatment.treatment_agency
  };
};

const monitoringJSON = (props: any) => {
  const { type, item } = props;
  var monitoringID;
  switch (type as string) {
    case 'mechanical':
      monitoringID = item.mechmonitoringid;
      break;
    case 'chemical':
      monitoringID = item.chemicalmonitoringid;
      break;
    case 'biological':
      monitoringID = item.biologicalmonitoringid;
      break;
    default:
      monitoringID = null;
  }
  return {
    monitoring_id: monitoringID,
    project_code: item.monitoring_paper_file_id,
    efficacy_code: item.efficacy_rating, // not in extract
    general_comment: null, // not in extract
    monitoring_date: item.inspection_date,
    primary_surveyor: item.primary_surveyor,
    efficacy_percent: (type as string) !== 'biological' ? item?.efficiency_rate : null,
    invasive_species_agency_code: item?.monitoring_agency
  };
};
