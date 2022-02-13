/// <reference types="cypress" />

import React from 'react';
import '../../support/index';

describe('GOING TO THE LOGIN PAGE', function () {
  let activityId;
  before(() => {
    cy.visit('localhost:3000/home/landing');
  });
  it('Check if on landing page', function () {
    cy.contains('Welcome');
  });
  it('Go to My Records Page', function () {
    cy.get('.css-1m5ei80 > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > :nth-child(4)').click('center');
    cy.contains('Observations');
  });
  it('Create Terrestrial Plant Observation', function () {
    cy.get(
      ':nth-child(1) > .MuiPaper-root > #panel-map-header > .makeStyles-toolbar-62 > :nth-child(2) > :nth-child(1)'
    ).click('center');
    cy.contains('Activity Observation Plant Terrestrial');
    cy.get('#activity_id').then(($var) => {
      activityId = $var.text();
    });
  });
  it('Display variable', function () {
    console.log(activityId);
  });
  it('Place Marker', function () {
    cy.get('.leaflet-draw-draw-marker').click('center');
    cy.get('.leaflet-container').click('center');
  });
  it('Basic Information', function () {
    // Employer
    cy.get('.MuiOutlinedInput-root > #root_activity_data_employer_code').click('center');
    cy.get('.MuiOutlinedInput-root > #root_activity_data_employer_code').type('The Coolest Guy');
    // // Funding Agency
    // cy.get(
    //   ':nth-child(9) > :nth-child(2) > #custom-multi-select > .MuiFormControl-root > .css-oyful7-container > .css-165m9mz-control > .css-2y7ope-ValueContainer'
    // ).click('center');
    // Access Description
    cy.get('.MuiOutlinedInput-root > #root_activity_data_access_description').click('center');
    cy.get('.MuiOutlinedInput-root > #root_activity_data_access_description').type('Only Cool Guys allowed >:(');
    cy.get('.MuiOutlinedInput-root > #root_activity_data_location_description').click('center');
    cy.get('.MuiOutlinedInput-root > #root_activity_data_location_description').type('The Coolest Location');
  });
  it('Jurisdiction', function () {
    // Cant Choose
    cy.get('#root_activity_data_jurisdictions_0_jurisdiction_code').click('center');
    cy.get('#root_activity_data_jurisdictions_0_jurisdiction_code').type('BC Hydro and Power Authority');
    // Percent Covered
    cy.get('.MuiOutlinedInput-root > #root_activity_data_jurisdictions_0_percent_covered').click('center');
    cy.get('.MuiOutlinedInput-root > #root_activity_data_jurisdictions_0_percent_covered').type('100');
  });
  it('Project Code and Comment', function () {
    // Project Code Description
    cy.get('#root_activity_data_project_code_0_description').click('center');
    cy.get('#root_activity_data_project_code_0_description').type('Cool Code');
    // Comment
    cy.get('#root_activity_data_general_comment').click('center');
    cy.get('#root_activity_data_general_comment').type('The plants are not cool here');
  });
  it('Observation Information', function () {
    // Pre-treatment Observation
    cy.get('#root_activity_type_data_pre_treatment_observation').click('center');
    cy.get('[data-value="Yes"]').click();
    // Observation Person
    cy.get('.MuiOutlinedInput-root > #root_activity_type_data_activity_persons_0_person_name').click('center');
    cy.get('.MuiOutlinedInput-root > #root_activity_type_data_activity_persons_0_person_name').type('Bobby Jones');
  });
  it('Observation Plant Terrestrial Information', function () {
    // Soil Texture
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_soil_texture_code').click('center');
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_soil_texture_code').type(
      'Coarse{enter}'
    );
    // Specific Use
    cy.get(
      ':nth-child(2) > :nth-child(2) > #custom-multi-select > .MuiFormControl-root > .css-oyful7-container > .css-165m9mz-control > .css-2y7ope-ValueContainer'
    ).click('center');
    cy.get('#react-select-3-option-0').click();
    // Slope
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_Observation_PlantTerrestrial_Information_slope_code'
    ).click('center');
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_Observation_PlantTerrestrial_Information_slope_code'
    ).type('Extreme slope{enter}');
    // Aspect
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_aspect_code').click('center');
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_aspect_code').type(
      'East Facing{enter}'
    );
    // Research Observation
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_research_detection_ind').click(
      'center'
    );
    cy.get('[data-value="Yes"]').click('center');
    // Visible Well Nearby
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_well_ind').click('center');
    cy.get('[data-value="Yes"]').click('center');
    // Suitable for biocontrol agents
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_suitable_for_biocontrol_agent').click(
      'center'
    );
    cy.get('[data-value="No"]').click('center');
  });
  it('Terrestrial Invasive Plants', function () {
    // Terrestrial Invasive Plants
    cy.get('.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_code').click(
      'center'
    );
    cy.get('.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_code').type(
      'Black henbane{enter}'
    );
    // Observation Type
    cy.get('#root_activity_subtype_data_TerrestrialPlants_0_occurrence').click('center');
    cy.get('#root_activity_subtype_data_TerrestrialPlants_0_occurrence').type('Positive occurance{enter}');
    // Density
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_density_code'
    ).click('center');
    cy.get('.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_density_code').type(
      '1|<={enter}'
    );
    // Distribution
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_distribution_code'
    ).click('center');
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_distribution_code'
    ).type('1|{enter}');
    // Life Stage
    cy.get('.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_plant_life_stage_code').click(
      'center'
    );
    cy.get('.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_plant_life_stage_code').type(
      'Juve{enter}'
    );
    // Voucher Specimen Collected
    cy.get('#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collected').click('center');
    cy.get('[data-value="Yes"]').click('center');
  });
  it('Voucher Specimen Collection', function () {
    // Voucher Sample ID
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_sample_id'
    ).click('center');
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_sample_id'
    ).type('12434{enter}');
    // Date Voucher Collected
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_date_voucher_collected'
    ).click('center');
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_date_voucher_collected'
    ).type('2021-09-09');
    // Date Voucher Verified
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_date_voucher_verified'
    ).click('center');
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_date_voucher_verified'
    ).type('2022-01-01');
    // Name of Herbarium
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_name_of_herbarium'
    ).click('center');
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_name_of_herbarium'
    ).type('The Cool Herbarium');
    // Accession number
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_name_of_herbarium'
    ).click('center');
    cy.get(
      '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_name_of_herbarium'
    ).type('54323');
    // Voucher Verification Completed by
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_verification_completed_by_person_name'
    ).click('center');
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_verification_completed_by_person_name'
    ).type('Joe Bob');
    // Org
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_verification_completed_by_organization'
    ).click('center');
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_verification_completed_by_organization'
    ).type('The JoeBob Org');
  });
  it('Save Record', function () {});
});
