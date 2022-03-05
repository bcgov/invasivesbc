/// <reference types="cypress" />

import '../../support/index';
import {
  accessDescriptionArray,
  chemApplicationMethods,
  commentArray,
  dateFormatter,
  herbicideCalculationTypes,
  herbicideGranulars,
  herbicideLiquids,
  herbicideTypes,
  humidityArray,
  invasivePlants,
  jurisdictions,
  locationDescriptionArray,
  nameArray,
  pestManagementPlans,
  projectCodeDescription,
  windDirectionArray,
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
  // - Treatment Information
  const treatmentPerson = faker.random.arrayElement(nameArray);
  const pesticideApplicator = faker.datatype.number({ min: 1000, max: 9999 });
  // - Chemical Treatment Information
  const pestManagementPlan = faker.random.arrayElement(pestManagementPlans);
  const temperature = faker.datatype.number({ min: 15, max: 22 });
  const windSpeed = faker.datatype.number({ min: 0, max: 5 });
  const windDirection = windSpeed > 0 ? faker.random.arrayElement(windDirectionArray) : 'No Wind{enter}';
  const humidity = faker.random.arrayElement(humidityArray);
  const treatmentNoticeSigns = faker.random.arrayElement(yesNo);
  const applicationStartTime = dateFormatter(new Date(faker.date.recent()));
  // - Pest Injury Threshold Determination
  const radioPestInjury = faker.datatype.number({ min: 1, max: 2 });
  const invasivePlant = faker.random.arrayElement(invasivePlants);
  // - Tank Mix
  // removed for now: const radioTankMix = faker.datatype.number({ min: 1, max: 2 });
  const chemApplicationMethod = faker.random.arrayElement(chemApplicationMethods);
  // - Herbicide Application
  let herbicideType;
  let herbicideCalculationType;
  console.log(chemApplicationMethod);
  switch (chemApplicationMethod) {
    case 'Basal Bark{enter}':
    case 'Cut Stump / Cut and Paint{enter}':
    case 'Cut and Insert{enter}':
    case 'Stem Injection{enter}':
    case 'Wick{enter}':
      herbicideType = 'liquid{enter}';
      herbicideCalculationType = 'Dilution{enter}';
      break;
    default:
      herbicideType = faker.random.arrayElement(herbicideTypes);
      herbicideCalculationType = faker.random.arrayElement(herbicideCalculationTypes);
  }
  console.log(herbicideType);
  let herbicide =
    herbicideType === 'liquid{enter}'
      ? faker.random.arrayElement(herbicideLiquids)
      : faker.random.arrayElement(herbicideGranulars);
  console.log(herbicide);
  // const herbicideLitres = faker.datatype.number({ min: 1, max: 4 });
  // const herbicideDilution = faker.datatype.number({ min: 1, max: 4 });
  // const herbicideArea = 1;

  before(() => {
    cy.log('CHECK IF configFile HAS CORRECT dbConfig IN ORDER TO TEST DATABASE');
    cy.log('LOG IN PRIOR TO RUNNING TEST');
    cy.wait(5000);
    cy.visit(Cypress.env('redirectUri'));
    if (Cypress.env().configFile === 'development') {
      cy.wait(35000);
    }
  });
  it('It goes to My Records Page', function () {
    cy.get('.css-1m5ei80 > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > :nth-child(4)').click('center');
    cy.contains('Observations');
  });
  it('It creates a Chemical Terrestrial Treatment record', function () {
    if (Cypress.env().configFile === 'development') {
      cy.get(':nth-child(2) > .MuiPaper-root > #panel-map-header > .jss62 > :nth-child(2) > :nth-child(1)').click(
        'center'
      );
    } else {
      cy.get(
        ':nth-child(2) > :nth-child(1) > #panel-map-header > .makeStyles-toolbar-62 > :nth-child(2) > :nth-child(1)'
      ).click('center');
    }
    cy.contains('Activity Treatment Chemical Plant Terrestrial');
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
    cy.wait(1000);
    // Access Description
    cy.get('.MuiOutlinedInput-root > #root_activity_data_access_description').type(accessDescription, {
      delay: 50
    });
    cy.get('.MuiOutlinedInput-root > #root_activity_data_location_description').type(locationDescription);
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
    // Treatment Person
    cy.get('.MuiOutlinedInput-root > #root_activity_type_data_activity_persons_0_person_name').type(treatmentPerson);
    // Pesticide Applicator Certificate Number
    cy.get('#root_activity_type_data_activity_persons_0_applicator_license').type(pesticideApplicator);
  });
  it('It inputs chemical treatment information', function () {
    // Pest Management Plan
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_Treatment_ChemicalPlant_Information_pest_management_plan'
    ).type(pestManagementPlan);
    // Temperature
    cy.get('.MuiOutlinedInput-root > #root_activity_subtype_data_Treatment_ChemicalPlant_Information_temperature').type(
      temperature
    );
    // Wind Speed
    cy.get('#root_activity_subtype_data_Treatment_ChemicalPlant_Information_wind_speed').click('center');
    cy.get('#root_activity_subtype_data_Treatment_ChemicalPlant_Information_wind_speed').type(
      '{backspace}' + windSpeed
    );
    // Wind Direction
    cy.get('#root_activity_subtype_data_Treatment_ChemicalPlant_Information_wind_direction_code').type(windDirection);
    // Humidity
    cy.get('#root_activity_subtype_data_Treatment_ChemicalPlant_Information_humidity').click('center');
    cy.get(`[data-value="${humidity}"]`).click('center');
    // Treatment Notice Signs
    cy.get('#root_activity_subtype_data_Treatment_ChemicalPlant_Information_signage_on_site').click('center');
    cy.get(`[data-value="${treatmentNoticeSigns}"]`).click('center');
    // Application Start Time
    cy.wait(250);
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_Treatment_ChemicalPlant_Information_application_start_time'
    ).click('center');
    cy.wait(250);
    cy.get(
      '.MuiOutlinedInput-root > #root_activity_subtype_data_Treatment_ChemicalPlant_Information_application_start_time'
    ).type(applicationStartTime + 'T08:30');
    cy.wait(250);
  });
  it('It can select a radio button of the Pest Injury Threshold Determination', function () {
    cy.get(
      `:nth-child(2) > .MuiGrid-container > .MuiGrid-root > .MuiFormControl-root > .MuiFormGroup-root > :nth-child(${radioPestInjury}) > .MuiTypography-root`
    ).click('center');
  });
  it('It can add an Invasives Plant', function () {
    cy.get('#btn_add_invasive_plant').trigger('click', 'center', {
      force: true
    });
    cy.wait(500);
    cy.get('#invasive_plant_code').type(invasivePlant);
  });
  /*it('It can select a Tank Mix radio buttons', function () {
    // Tank Mix
    cy.get('#tank_mix_on').trigger('click', {
      force: true
    });
  })*/
  it('It can add a Chemical Application Method', function () {
    // Chemical Application Method
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiOutlinedInput-root').type(
      chemApplicationMethod
    );
  });
  it('It can add a herbicide mix', function () {
    // Add Herbicide button
    cy.get('#btn_add_herbicide').trigger('click', 'center');
    // Herbicide Type
    cy.get('#herbicide-type').type(herbicideType);
    // Herbicide
    cy.get('#herbicide-code').type(herbicide);
    // Calculation Type
    cy.get(':nth-child(7) > .MuiFormControl-root > .MuiOutlinedInput-root > #calculation_type').type(
      herbicideCalculationType
    );
    // Amount of Mix Used (L)
    cy.get('#amount-of-mix-used').type('1');
    // Dilution (%)
    cy.get('#dilution').type('1');
    // Area Treated (sqm)
    cy.get('#area-treated').type('1');
    // if (herbicideCalculationType === 'Product Application Rate{enter}') {
    //   cy.get('#mui-92').type(herbicideArea)
    // }
  });
  it('It can save and submit the record', function () {
    cy.get('.css-acctgf-MuiGrid-root > .MuiGrid-container > :nth-child(1) > .MuiButton-root').click('center');
    cy.get('.MuiAlert-action > .MuiButtonBase-root > [data-testid=CloseIcon]').click('center');
    cy.get('[aria-label="Ready to submit, form is validated and has no issues."] > .MuiButton-root').click('center');
    cy.get('.MuiDialogActions-root > :nth-child(2)').click('center');
  });
  // it('It can verify the record is on the database', function () {
  //   cy.task('DATABASE', {
  //     dbConfig: Cypress.env('dbConfig'),
  //     sql: `select * from invasivesbc.observation_terrestrial_plant_summary order by activity_incoming_data_id desc limit 1`
  //   }).then((result) => {
  //     (result as any).rows.map((row) => {
  //       myTestRow = row;
  //       console.log(row);
  //     });
  //   });
  // })
});
