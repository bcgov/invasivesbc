/// <reference types="cypress" />

import React from 'react';
import '../../support/index';

describe('can get to Map Page from Landing Page', function () {
  it('Map Page test', function () {
    cy.visit('localhost:3000/home/landing');
    cy.addBoard('BETA');
    cy.get('.MuiAvatar-root').click();
    cy.get('.MuiList-root > [tabindex="0"]').find('.MuiSwitch-root').click();
    cy.get('body').click();
    cy.get('.MuiTypography-root').contains('Welcome');
    cy.get(
      '.MuiGrid-grid-xs-11 > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > [tabindex="-1"] > .MuiTab-wrapper'
    ).click();
    cy.get('.MuiGrid-grid-xs-1 > .MuiButtonBase-root').click();
    cy.get('.MuiList-root > [tabindex="0"]').find('.MuiSwitch-root').click();
    cy.get('body').click();
    cy.get('[aria-label="my position"]').click();
  });
});

describe('can open getPosition Popup', function () {
  before(() => {
    cy.log('starting popup test');
    cy.wait(5000);
  });
  it('React Leaflet Popup click test', function () {
    //cy.get('.leaflet-marker-icon .leaflet-zoom-animated .leaflet-interactive').click();
    cy.get('.leaflet-container').find('.leaflet-interactive').click();
    cy.get('.leaflet-popup-content > :nth-child(3) > :nth-child(1)').contains('Within');
  });
});

describe('Can interact with popup', function () {
  before(() => {
    cy.log('LOADING POPUP FUNCTIONALITY TEST');
    cy.wait(3000);
  });
  it('Functionality Tests', function () {
    cy.get('.leaflet-popup-content > :nth-child(3) > :nth-child(1)').find('.MuiSwitch-root').click();
    cy.wait(1000);
    cy.get('.leaflet-popup-content > :nth-child(3) > :nth-child(1)').find('.MuiSwitch-root').click();
    cy.get(':nth-child(3) > :nth-child(3) > .MuiButtonBase-root > .MuiButton-label').click();
    cy.wait(1000);
  });
});
