/// <reference types="cypress" />

import React from 'react';
import '../../support/index';

const openColorPickerTest = (value1, value2) => {
  it('Open layer picker and use colorpicker', function () {
    const invasivesbcRecords = '#invasivesbc_records';
    const aquaticLayersAndWells = '#aquatic_layers_and_wells';
    const accordionSummary = ' > #parent-accordion > #accordion-grid > #accordion-summary > ';
    cy.dragAccordion(invasivesbcRecords, aquaticLayersAndWells);
    // click accordion
    cy.wait(500);
    cy.get(invasivesbcRecords).click();
    // click colorpicker btn
    cy.get('#colorpicker-btn').should('exist');
    cy.wait(500);
    cy.get('#colorpicker-btn').click({ force: true });
    // click colorpicker box
    cy.get('.MuiInputBase-input').click();
    cy.get('.saturation-black').click(value1, value2, { force: true });
    // click colorpicker box
    cy.get('.MuiInputBase-input').click();
    cy.get('.hue-horizontal').click('center');
    cy.get('#close-btn').click();
    cy.get('#invasivesbc_records').click();
  });
};

describe('GOING TO THE MAP PAGE', function () {
  before(() => {
    cy.visit('localhost:3000/home/landing');
  });
  it('Switch app theme', function () {
    cy.get('.MuiAvatar-root').click();
    cy.themeTextCheck();
    cy.get('body').click();
  });
  after(() => {
    cy.get(
      '.MuiGrid-grid-xs-11 > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > [tabindex="-1"] > .MuiTab-wrapper'
    ).trigger('click');
  });
});

describe('OPENING THE LAYER PICKER LIGHT THEME', function () {
  before(() => {
    cy.get('.MuiPaper-root > .MuiButtonBase-root').trigger('click');
  });

  openColorPickerTest(20, 20);

  after(() => {
    cy.get('body').click('center');
  });
});

describe('OPENING THE LAYER PICKER DARK THEME', function () {
  before(() => {
    cy.changeTheme();
    cy.get('.MuiPaper-root > .MuiButtonBase-root').trigger('click');
  });

  openColorPickerTest(-5, 30);

  after(() => {
    cy.get('body').click();
    cy.changeTheme();
  });
});

describe('ENABLING LAYER ONTO MAP', function () {
  before(() => {
    cy.get('.leaflet-container').dblclick();
    cy.get('#layer-picker-btn').click();
  });
  it('Open Administrative Boundaries and Select Layer', function () {
    const adminBoundaries = '#administrative_boundaries';
    const invasivesbcRecords = '#invasivesbc_records';
    const childId = '#ministry_of_transportations_reagional';
    cy.get(adminBoundaries).should('exist');
    cy.clickChildCheckbox(adminBoundaries, childId);
    cy.toggleParentAccordion(adminBoundaries);
    cy.dragAccordion(adminBoundaries, invasivesbcRecords);
    cy.clickChildCheckbox(adminBoundaries, childId);
    cy.toggleParentAccordion(adminBoundaries);
  });
  after(() => {
    cy.get('body').click();
  });
});

describe('SWITCHING LAYER MODES', function () {
  before(() => {
    cy.get('[aria-label="my position"]').click();
    cy.wait(10000);
    cy.get('[data-index="11"]').click();
    cy.get('#layer-picker-btn').click();
  });
  it('Visual test to see if the layer mode changes from wms_online to wfs_online', function () {
    const aquaticLayersAndWells = '#aquatic_layers_and_wells';
    const childId = '#freshwater_wells';
    // Visual check
    cy.clickChildCheckbox(aquaticLayersAndWells, childId);
    cy.get(childId + ' > :nth-child(3) > #settings-btn').click();
    cy.get('#server-accordion').click();
    cy.get('#radio-group > :nth-child(3)').click();
    cy.get('#server-accordion > #accordion-summary').click();
    cy.get('#close-btn').click();
    cy.get('body').click();
    cy.get('.leaflet-container').dblclick();
  });
});
