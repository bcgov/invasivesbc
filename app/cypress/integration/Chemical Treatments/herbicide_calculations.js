// untitled.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
/// <reference types="cypress" />

import { isWeedPoison } from '../../../src/utils/herbicideCalculator';
// math exports a default object with methods

describe('can test for weed poison', function () {
  before(() => {
    //pre test steps
  });

  context('src/utils/herbicideCalculator.ts', function () {
    it('accepts string', function () {
      expect(isWeedPoison('test')).to.eq(false);
    });

    it('can find poison', function () {
      expect(isWeedPoison('test1234558901')).to.eq(true);
    });
  });
});
