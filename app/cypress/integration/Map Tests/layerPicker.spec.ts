/// <reference types="cypress" />

import React from 'react';
import { changeTheme, themeTextCheck } from '../../support/commands/landingTestCmds';
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
  before(() => {});

  it('Open layer picker and check theme colors', function () {});

  after(() => {
    cy.changeTheme();
  });
});
