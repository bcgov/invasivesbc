/// <reference types="cypress" />

import { min, values } from 'cypress/types/lodash';
import React from 'react';
import '../../support/index';
import {
  aspectArray,
  dateFormatter,
  densityArray,
  distributionArray,
  getShortActivityID,
  invasivePlants,
  jurisdictions,
  lifeStageArray,
  positiveNegative,
  slopeArray,
  soilTextureArray,
  yesNo
} from '../../support/index';
const { faker } = require('@faker-js/faker');

describe('CREATING A NEW RECORD', function () {
  let myTestId;
  let myTestRow;
  // INPUT VARIABLES
  // - Basic Information
  const accessDescription = 'Only cool guys allowed';
  const locationDescription = 'The coolest location';
  // - Jurisdictions
  const jurisdictionCode = faker.random.arrayElement(jurisdictions);
  const percentCovered = '100';
  // - Project Code
  const description = 'Cool Code';
  const comment = 'The plants are not cool here';
  // - Observation Information
  const preTreatmentObservation = faker.random.arrayElement(yesNo);
  const observationPerson = faker.name.findName();
  // - Observation Plant Terrestrial Information
  const soilTexture = faker.random.arrayElement(soilTextureArray);
  const specificUse = faker.datatype.number({ max: 24 });
  const slope = faker.random.arrayElement(slopeArray);
  const aspect = slope === 'flat 0{enter}' ? 'fla{enter}' : faker.random.arrayElement(aspectArray);
  const researchObservation = faker.random.arrayElement(yesNo);
  const visibleWellNearby = faker.random.arrayElement(yesNo);
  const suitableForBiocontrolAgents = faker.random.arrayElement(yesNo);
  // - Terrestrial Invasive Plants
  const invasivePlant = faker.random.arrayElement(invasivePlants);
  const observationType = faker.random.arrayElement(positiveNegative);
  const densityCode = faker.random.arrayElement(densityArray);
  const distribution = faker.random.arrayElement(distributionArray);
  const lifeStage = faker.random.arrayElement(lifeStageArray);
  const voucherPresent = observationType === 'negative{enter}' ? 'No' : faker.random.arrayElement(yesNo);

  // - Voucher
  const voucherName = faker.name.findName();
  const voucherSampleId = faker.random.number({ min: 1000, max: 9999 });
  const herbarium = 'The Cool Herbarium';
  const accessionNumber = faker.random.number({ min: 100000, max: 999999 });
  const companyName = faker.company.companyName();
  let utmZone;
  let utmEasting;
  let utmNorthing;

  before(() => {
    cy.visit('http://localhost:3000');
  });
  it('It goes to My Records Page', function () {
    cy.get('.css-1m5ei80 > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > :nth-child(4)').click('center');
    cy.contains('Observations');
  });
  it('It creates a Terrestrial Plant Observation record', function () {
    cy.get(
      ':nth-child(1) > .MuiPaper-root > #panel-map-header > .makeStyles-toolbar-62 > :nth-child(2) > :nth-child(1)'
    ).click('center');
    cy.contains('Activity Observation Plant Terrestrial');
  });
  it('It places a marker', function () {
    cy.get('.leaflet-draw-draw-marker').click('center');
    cy.get('.leaflet-container').click('center');
  });
  it('It inputs basic information', function () {
    // Employer
    // cy.get('.MuiOutlinedInput-root > #root_activity_data_employer_code').type('The Coolest Guy');
    // // Funding Agency
    // cy.get(
    //   ':nth-child(9) > :nth-child(2) > #custom-multi-select > .MuiFormControl-root > .css-oyful7-container > .css-165m9mz-control > .css-2y7ope-ValueContainer'
    // ).type('center');
    // Access Description
    cy.get('.MuiOutlinedInput-root > #root_activity_data_access_description').type(accessDescription);
    cy.get('.MuiOutlinedInput-root > #root_activity_data_location_description').type(locationDescription);
  });
  it('It can get the Activity ID', function () {
    cy.get('.css-ai165o > :nth-child(1)')
      .invoke('text')
      .then(($var) => {
        myTestId = $var.substring(13);
        console.log('myTestId', myTestId);
      });
  });
  it('It can get the UTM values and save them', function () {
    cy.get('#root_activity_data_utm_zone')
      .invoke('val')
      .then(($var) => {
        utmZone = $var;
      });
    cy.get('#root_activity_data_utm_easting')
      .invoke('val')
      .then(($var) => {
        utmEasting = $var;
      });
    cy.get('#root_activity_data_utm_northing')
      .invoke('val')
      .then(($var) => {
        utmNorthing = $var;
      });
  });
  it('It inputs one jurisdiction', function () {
    // Jurisdiction
    cy.get('#root_activity_data_jurisdictions_0_jurisdiction_code').type(jurisdictionCode);
    // Percent Covered
    cy.get('.MuiOutlinedInput-root > #root_activity_data_jurisdictions_0_percent_covered').type(percentCovered);
  });
  it('It inputs the project code and comment', function () {
    // Project Code Description
    cy.get('#root_activity_data_project_code_0_description').type('Cool Code');
    // Comment
    cy.get('#root_activity_data_general_comment').type('The plants are not cool here');
  });
  it('It inputs observation information', function () {
    // Pre-treatment Observation
    cy.get('#root_activity_type_data_pre_treatment_observation').click('center');
    cy.get(`[data-value="${preTreatmentObservation}"]`).click();
    // Observation Person
    cy.get('.MuiOutlinedInput-root > #root_activity_type_data_activity_persons_0_person_name').type(observationPerson);
  });
  it('It inputs Observation Plant Terrestrial Information', function () {
    // Soil Texture
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_soil_texture_code').type(soilTexture);
    // Specific Use
    cy.get(
      ':nth-child(2) > :nth-child(2) > #custom-multi-select > .MuiFormControl-root > .css-oyful7-container > .css-165m9mz-control > .css-2y7ope-ValueContainer'
    ).click('center');
    cy.get(`#react-select-3-option-${specificUse}`).click();
    // Slope
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_Observation_PlantTerrestrial_Information_slope_code'
    ).type(slope);
    // Aspect
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_aspect_code').type(aspect);
    // Research Observation
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_research_detection_ind').click(
      'center'
    );
    cy.get(`[data-value="${researchObservation}"]`).click('center');
    // Visible Well Nearby
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_well_ind').click('center');
    cy.get(`[data-value="${visibleWellNearby}"]`).click('center');
    // Suitable for biocontrol agents
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_suitable_for_biocontrol_agent').click(
      'center'
    );
    cy.get(`[data-value="${suitableForBiocontrolAgents}"]`).click('center');
  });
  it('Terrestrial Invasive Plants', function () {
    // Terrestrial Invasive Plants
    cy.get('.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_code').type(
      invasivePlant
    );
    // Observation Type
    cy.get('#root_activity_subtype_data_TerrestrialPlants_0_occurrence').type(observationType);
    if (observationType === 'positive{enter}') {
      // Density
      cy.get(
        '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_density_code'
      ).type(densityCode);
      // Distribution
      cy.get(
        '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_invasive_plant_distribution_code'
      ).type(distribution);
      // Life Stage
      cy.get('.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_plant_life_stage_code').type(
        lifeStage
      );
      // Voucher Specimen Collected
      cy.get('#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collected').click('center');
      cy.get(`[data-value="${voucherPresent}"]`).click('center');
    }
  });
  if (voucherPresent === 'Yes') {
    // Input Dates
    const collectedDate = dateFormatter(new Date(faker.date.recent()));
    const verifiedDate = dateFormatter(new Date(faker.date.between('2021-01-01', '2022-02-02')));
    it('Voucher Specimen Collection', function () {
      // Voucher Sample ID
      cy.get(
        '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_sample_id'
      ).type(`${voucherSampleId}{enter}`);
      // Date Voucher Collected
      cy.get(
        '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_date_voucher_collected'
      ).type(collectedDate);
      // Date Voucher Verified
      cy.get(
        '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_date_voucher_verified'
      ).type(verifiedDate);
      // Name of Herbarium
      cy.get(
        '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_name_of_herbarium'
      ).type(herbarium);
      // Accession number
      cy.get(
        '#root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_accession_number'
      ).type(accessionNumber);
      // Voucher Verification Completed by
      cy.get(
        '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_verification_completed_by_person_name'
      ).type(voucherName);
      // Organization
      cy.get(
        '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_voucher_verification_completed_by_organization'
      ).type(companyName);
      // UTM Zone
      cy.get(
        '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_exact_utm_coords_utm_zone'
      ).type(utmZone);
      // UTM Easting
      cy.get(
        '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_exact_utm_coords_utm_easting'
      ).type(utmEasting);
      // UTM Northing
      cy.get(
        '.MuiOutlinedInput-root > #root_activity_subtype_data_TerrestrialPlants_0_voucher_specimen_collection_information_exact_utm_coords_utm_northing'
      ).type(utmNorthing);
    });
  }
  it('It can verify get the activity from the database', function () {
    cy.task('DATABASE', {
      dbConfig: {
        user: 'invasivebc',
        host: 'localhost',
        database: 'InvasivesBC',
        password: 'postgres',
        port: 5432
      },
      sql: `select * from invasivesbc.observation_terrestrialplant limit 3`
    }).then((result) => {
      (result as any).rows.map((row) => {
        const dbActivity = getShortActivityID(row);
        if (dbActivity === myTestId) {
          myTestRow = row;
        }
        console.log('row', row);
      });
    });
  });

  after(() => {
    cy.get('.css-acctgf-MuiGrid-root > .MuiGrid-container > :nth-child(1) > .MuiButton-root').click();
    cy.get('.css-1m5ei80 > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > :nth-child(4)').click();
  });
});
