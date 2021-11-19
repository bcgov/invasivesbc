/// <reference types="cypress" />

import React from 'react';
import { changeTheme, themeTextCheck } from '../../support/commands/themeTestCmds';
import '../../support/index';

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

  it('Open layer picker and check theme colors', function () {
    // text color check
    cy.get('#invasivesbc_records .MuiPaper-root').should('have.css', 'color', 'rgba(0, 0, 0, 0.87)');
    cy.get('#invasivesbc_records > #parent-accordion > #accordion-grid > #draghandle').should('exist');
    cy.get('#invasivesbc_records > #parent-accordion > #accordion-grid > #draghandle')
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 0, clientY: -50 })
      .trigger('mouseup');
    cy.get('#aquatic_layers_and_wells > #parent-accordion > #accordion-grid > #draghandle').should('exist');
  });

  after(() => {
    cy.changeTheme();
  });
});
