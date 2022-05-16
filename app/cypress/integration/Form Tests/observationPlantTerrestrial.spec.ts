/// <reference types="cypress" />

import { min, values } from 'cypress/types/lodash';
import React from 'react';
import '../../support/index';
import {
  accessDescriptionArray,
  aspectArray,
  commentArray,
  dateFormatter,
  densityArray,
  distributionArray,
  invasivePlants,
  jurisdictions,
  lifeStageArray,
  locationDescriptionArray,
  nameArray,
  positiveNegative,
  projectCodeDescription,
  slopeArray,
  soilTextureArray,
  yesNo
} from '../../support/index';
const { faker } = require('@faker-js/faker');

describe('CREATING A NEW RECORD', function () {
  let myTestRow;
  // INPUT VARIABLES
  // - Basic Information
  const accessDescription = faker.random.arrayElement(accessDescriptionArray);
  const locationDescription = faker.random.arrayElement(locationDescriptionArray);
  // - Jurisdictions
  const jurisdictionCode = faker.random.arrayElement(jurisdictions);
  const percentCovered = '100';
  // - Project Code
  const description = faker.random.arrayElement(projectCodeDescription);
  const comment = faker.random.arrayElement(commentArray);
  // - Observation Information
  const preTreatmentObservation = faker.random.arrayElement(yesNo);
  // - Observation Plant Terrestrial Information
  const soilTexture = faker.random.arrayElement(soilTextureArray);
  const specificUse = faker.datatype.number({ max: 24 });
  const slope = faker.random.arrayElement(slopeArray);
  // const slope = 'flat 0{enter}';
  const aspect = slope === 'flat 0{enter}' ? 'fla{enter}' : faker.random.arrayElement(aspectArray);
  const researchObservation = faker.random.arrayElement(yesNo);
  const visibleWellNearby = faker.random.arrayElement(yesNo);
  const suitableForBiocontrolAgents = faker.random.arrayElement(yesNo);
  // - Terrestrial Invasive Plants
  const invasivePlant = faker.random.arrayElement(invasivePlants);
  const observationType = faker.random.arrayElement(positiveNegative);
  // const observationType = 'positive{enter}';
  const densityCode = faker.random.arrayElement(densityArray);
  const distribution = faker.random.arrayElement(distributionArray);
  const lifeStage = faker.random.arrayElement(lifeStageArray);
  const voucherPresent = observationType === 'negative{enter}' ? 'No' : faker.random.arrayElement(yesNo);
  // const voucherPresent = 'Yes';

  // - Voucher
  const voucherName = faker.random.arrayElement(nameArray);
  const voucherSampleId = faker.random.number({ min: 1000, max: 9999 });
  const companyName = faker.company.companyName();
  const accessionNumber = faker.random.number({ min: 100000, max: 999999 });
  const herbarium = 'The Cool Herbarium';
  let utmZone;
  let utmEasting;
  let utmNorthing;
  // Input Dates
  const collectedDate = dateFormatter(new Date(faker.date.recent()));
  const verifiedDate = dateFormatter(new Date(faker.date.between('2021-01-01', '2022-02-02')));

  // before(() => {
  // cy.log('CHECK IF configFile HAS CORRECT dbConfig IN ORDER TO TEST DATABASE');
  // cy.log('LOG IN PRIOR TO RUNNING TEST');
  // cy.wait(5000);
  // cy.visit(Cypress.env('redirectUri'));
  // });
  // it('It goes to My Records Page', function () {
  //   cy.get('[data-testid=HomeWorkIcon]').click('center');
  // });
  it('It is a buffer that may or may not fail', function () {
    cy.wait(1500);
  });
  it('It creates a Terrestrial Plant Observation record', function () {
    // Open Show Records Tab
    cy.get('#show-records-tab').click('center');
    // Click New Record Button
    cy.get('[data-testid=AddIcon]').click('center');
    // Record Category
    cy.get(':nth-child(1) > .MuiOutlinedInput-root > .MuiSelect-select').click('center');
    cy.get('.MuiList-root > [tabindex="0"]').click('center');
    // Record Type
    cy.get(':nth-child(3) > .MuiOutlinedInput-root > .MuiSelect-select').click('center');
    cy.get('.MuiList-root > [tabindex="0"]').click('center');
    // Record Sub-Type
    cy.get(':nth-child(5) > .MuiOutlinedInput-root > .MuiSelect-select').click('center');
    cy.get('.MuiList-root > [tabindex="0"]').click('center');
    // Page Check
    cy.get('.MuiDialogActions-root > .MuiButton-contained').click('center');
  });

  it('It is a buffer that may or may not fail', function () {
    cy.wait(1500);
  });
  it('It places a marker', function () {
    cy.get('.leaflet-container').click('center');
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
    cy.wait(1000);
    // Access Description
    cy.get('.MuiOutlinedInput-root > #root_activity_data_access_description').type(accessDescription, {
      delay: 5
    });
    cy.get('.MuiOutlinedInput-root > #root_activity_data_location_description').type(locationDescription);
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
    cy.get('#root_activity_data_project_code_0_description').type(description);
    // Comment
    cy.get('#root_activity_data_general_comment').type(comment);
  });
  it('It inputs observation information', function () {
    // Pre-treatment Observation
    cy.get('#root_activity_type_data_pre_treatment_observation').click('center');
    cy.get(`[data-value="${preTreatmentObservation}"]`).click();
  });
  it('It inputs Observation Plant Terrestrial Information', function () {
    // Soil Texture
    cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_soil_texture_code').type(soilTexture);
    // Specific Use
    cy.get(
      ':nth-child(2) > :nth-child(2) > #custom-multi-select > .MuiFormControl-root > .css-oyful7-container > .css-165m9mz-control > .css-2y7ope-ValueContainer'
    )
      .click('center')
      .type('None{enter}');
    // Slope
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_Observation_PlantTerrestrial_Information_slope_code'
    ).type(slope);

    if (slope !== 'flat 0{enter}') {
      // Aspect
      cy.wait(500);
      cy.get('#root_activity_subtype_data_Observation_PlantTerrestrial_Information_aspect_code').type(aspect);
    }
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
  it('It can get the activity from the database', function () {
    cy.get('.css-acctgf-MuiGrid-root > .MuiGrid-container > :nth-child(1) > .MuiButton-root').click('center');
    cy.get('.MuiAlert-action > .MuiButtonBase-root > [data-testid=CloseIcon]').click('center');
    cy.get('.css-acctgf-MuiGrid-root > .MuiGrid-container > :nth-child(1) > .MuiButton-root').click('center');
    cy.get('[aria-label="Ready to submit, form is validated and has no issues."] > .MuiButton-root').trigger('click', {
      force: true
    });
    cy.get('.MuiDialogActions-root > :nth-child(2)').trigger('click', {
      force: true
    });
    cy.task('DATABASE', {
      dbConfig: Cypress.env('dbConfig'),
      sql: `select * from invasivesbc.observation_terrestrial_plant_summary order by activity_incoming_data_id desc limit 1`
    }).then((result) => {
      (result as any).rows.map((row) => {
        myTestRow = row;
        console.log(row);
      });
    });
  });
  it('It can verify the database values', function () {
    // expect(myTestRow.access_description).to.eq(accessDescription);
    expect(myTestRow.location_description).to.eq(locationDescription);
    // expect(myTestRow.jurisdiction.substring(0, jurisdictionCode.length - 7)).to.eq(
    //   jurisdictionCode.substring(0, jurisdictionCode.length - 7)
    // );
    expect(myTestRow.project_code).to.eq(description);
    expect(myTestRow.comment).to.eq(comment);
    expect(myTestRow.pre_treatment_observation).to.eq(preTreatmentObservation);
    expect(myTestRow.soil_texture.substring(0, soilTexture.length - 7).toLowerCase()).to.eq(
      soilTexture.substring(0, soilTexture.length - 7)
    );
    // expect(myTestRow.specific_use.substring(0, specificUse.length - 7).toLowerCase()).to.eq(
    //   specificUse.substring(0, specificUse.length - 7)
    // );
    expect(myTestRow.slope.substring(0, slope.length - 7).toLowerCase()).to.eq(slope.substring(0, slope.length - 7));
    expect(myTestRow.aspect.substring(0, aspect.length - 7).toLowerCase()).to.eq(
      aspect.substring(0, aspect.length - 7)
    );
    expect(myTestRow.research_observation).to.eq(researchObservation);
    expect(myTestRow.visible_well_nearby).to.eq(visibleWellNearby);
    expect(myTestRow.suitable_for_biocontrol_agent).to.eq(suitableForBiocontrolAgents);
    expect(myTestRow.invasive_plant.substring(0, invasivePlant.length - 7).toLowerCase()).to.eq(
      invasivePlant.substring(0, invasivePlant.length - 7)
    );
    if (observationType === 'positive{enter}') {
      expect(myTestRow.density.substring(0, densityCode.length - 7).toLowerCase()).to.eq(
        densityCode.substring(0, densityCode.length - 7)
      );
      expect(myTestRow.distribution.substring(0, distribution.length - 7)).to.eq(
        distribution.substring(0, distribution.length - 7)
      );
      expect(myTestRow.life_stage.toLowerCase()).to.contains(lifeStage.substring(0, lifeStage.length - 7));
      if (voucherPresent === 'Yes') {
        expect(myTestRow.voucher_sample_id).to.eq(voucherSampleId.toString());
        // expect(myTestRow.date_voucher_collected).to.equal(collect)
        // skip dates
        // herbarium name
        expect(myTestRow.accession_number).to.eq(accessionNumber.toString());
        expect(myTestRow.voucher_person_name).to.eq(voucherName);
        expect(myTestRow.voucher_organization).to.eq(companyName);
        expect(myTestRow.voucher_utm_zone).to.eq(utmZone);
        expect(myTestRow.voucher_utm_easting).to.eq(utmEasting);
        expect(myTestRow.voucher_utm_northing).to.eq(utmNorthing);
      }
    }
  });

  after('It can verify the database values', () => {});
});
