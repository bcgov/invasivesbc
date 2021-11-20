/// <reference types="cypress" />

import React from 'react';
import { changeTheme, themeTextCheck } from '../../support/commands/themeTestCmds';
import '../../support/index';

const openColorPickerTest = () => {
  it('Open layer picker and use colorpicker', function () {
    const invasivesRecordsDragHandle = '#invasivesbc_records > #parent-accordion > #accordion-grid > #draghandle';
    const aquaticLayersAndWellsDragHandle =
      '#aquatic_layers_and_wells > #parent-accordion > #accordion-grid > #draghandle';
    cy.dragAccordion(invasivesRecordsDragHandle, aquaticLayersAndWellsDragHandle);
    // click accordion
    cy.get('#invasivesbc_records').click();
    // click colorpicker btn
    cy.get('#invasivesbc_records #colorpicker-btn').click();
    // click colorpicker box
    cy.get('.MuiInputBase-input').click();
    cy.get('.saturation-black').click(20, 20, { force: true });
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

  openColorPickerTest();

  after(() => {
    cy.get('body').click('center');
  });
});

describe('OPENING THE LAYER PICKER DARK THEME', function () {
  before(() => {
    cy.changeTheme();
    cy.get('.MuiPaper-root > .MuiButtonBase-root').trigger('click');
  });

  openColorPickerTest();

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
    cy.get(adminBoundaries).should('exist');
    cy.get(adminBoundaries).click();
    cy.get('#ministry_of_transportations_reagional > :nth-child(1)').click('center');
    cy.get(adminBoundaries + '> #parent-accordion > #accordion-grid > #accordion-summary').click('center');
    const invasivesbcRecords = '#invasivesbc_records';
    cy.dragAccordion(adminBoundaries, invasivesbcRecords);
    cy.get(adminBoundaries + '> #parent-accordion').click();
  });
});
