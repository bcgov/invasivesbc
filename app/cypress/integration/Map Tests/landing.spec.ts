/// <reference types="cypress" />

import React from 'react';
import { themeTextCheck } from '../../support/commands/landingTestCmds';
import '../../support/index';

describe('GOING TO THE MAP PAGE', function () {
  before(() => {
    cy.visit('localhost:3000/home/landing');
  });
  it('Switch app theme', function () {
    cy.get('.MuiAvatar-root').click();
    cy.themeTextCheck();
    cy.themeTextCheck();
    cy.themeTextCheck();
    cy.themeTextCheck();
    cy.get('body').click();
  });
});
