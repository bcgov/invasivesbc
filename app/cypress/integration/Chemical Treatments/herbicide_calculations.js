// untitled.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
/// <reference types="cypress" />

import {
  isWeedPoison,
  sSpecie_sLHerb_spray_usingProdAppRate,
  mSpecie_sLHerb_spray_usingProdAppRate,
  sSpecie_sLHerb_spray_usingDilutionPercent,
  mSpecie_sLHerb_spray_usingDilutionPercent,
  sSpecie_sGHerb_spray_usingProdAppRate,
  sSpecie_sGHerb_spray_usingDilutionPercent,
  sSpecie_sLHerb_direct_usingDilutionPercent,
  mSpecie_mLGHerb_spray_usingProdAppRate
} from '../../../src/utils/herbicideCalculator';
// math exports a default object with methods

describe('can test for weed poison', function () {
  const area = 165;
  before(() => {
    //pre test steps
  });

  context('src/utils/herbicideCalculator.ts', function () {
    it('passed scenario #1', function () {
      expect(JSON.stringify(sSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400))).to.eq(
        JSON.stringify({
          dilution: 0.5,
          area_treated_hectares: 0.0125,
          area_treated_sqm: 125,
          percent_area_covered: 75.8,
          amount_of_undiluted_herbicide_used: 0.025
        })
      );
    });

    it('passed scenario #2', function () {
      expect(JSON.stringify(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]))).to.eq(
        JSON.stringify({
          dilution: 0.5,
          amounts_of_mix_used: [3.75, 1.25],
          areas_treated_hectares: [0.0094, 0.0031],
          areas_treated_sqm: [93.75, 31.25],
          percentages_area_covered: [56.8, 18.9],
          amounts_of_undiluted_herbicide_used: [0.0188, 0.0063]
        })
      );
    });

    it('passed scenario #3', function () {
      expect(JSON.stringify(sSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125))).to.eq(
        JSON.stringify({
          area_treated_hectares: 0.0125,
          percent_area_covered: 75.8,
          amount_of_undiluted_herbicide_used: 0.1
        })
      );
    });

    it('passed scenario #4', function () {
      expect(JSON.stringify(mSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125, [75, 25]))).to.eq(
        JSON.stringify({
          area_treated_hectares: 0.0125,
          areas_treated_sqm: [93.75, 31.25],
          percentages_area_covered: [56.8, 18.9],
          amounts_of_undiluted_herbicide_used: [0.075, 0.025]
        })
      );
    });

    it('passed scenario #5', function () {
      expect(JSON.stringify(sSpecie_sGHerb_spray_usingProdAppRate(area, 230, 5, 400))).to.eq(
        JSON.stringify({
          product_application_rate_lha: 0.23,
          dilution: 0.06,
          area_treated_hectares: 0.0125,
          area_treated_sqm: 125,
          percent_area_covered: 75.8,
          amount_of_undiluted_herbicide_used: 0.00287
        })
      );
    });

    it('passed scenario #6', function () {
      expect(JSON.stringify(sSpecie_sGHerb_spray_usingDilutionPercent(area, 5, 0.023, 100))).to.eq(
        JSON.stringify({
          area_treated_hectares: 0.01,
          percent_area_covered: 60.6,
          amount_of_undiluted_herbicide_used: 0.00115
        })
      );
    });

    it('passed scenario #7', function () {
      expect(JSON.stringify(sSpecie_sLHerb_direct_usingDilutionPercent(area, 1, 50, 30))).to.eq(
        JSON.stringify({
          area_treated_hectares: 0.003,
          percent_area_covered: 18.2,
          amount_of_undiluted_herbicide_used: 0.5
        })
      );
    });

    const herbicide1 = {
      product_application_rate_lha: 2
    };
    const herbicide2 = {
      product_application_rate_lha: 0.64
    };

    const herbicideArr = [herbicide1, herbicide2];

    const specie1 = {
      herbicides: herbicideArr,
      area_of_specie: 75
    };
    const specie2 = {
      herbicides: herbicideArr,
      area_of_specie: 25
    };

    const speciesArr = [specie1, specie2];

    it('passed scenario #8', function () {
      expect(JSON.stringify(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr))).to.eq(
        JSON.stringify([
          {
            herbicides: [
              {
                product_application_rate_lha: 2,
                dilution: 0.5,
                amount_of_undiluted_herbicide_used: 0.0188
              },
              {
                product_application_rate_lha: 0.64,
                dilution: 0.2,
                amount_of_undiluted_herbicide_used: 0.006
              }
            ],
            area_of_specie: 75,
            area_treated_ha: 0.0094,
            area_treated_sqm: 93.75,
            percent_area_covered: 56.8,
            amount_of_mix_used: 3.75
          },
          {
            herbicides: [
              {
                product_application_rate_lha: 2,
                dilution: 0.5,
                amount_of_undiluted_herbicide_used: 0.0063
              },
              {
                product_application_rate_lha: 0.64,
                dilution: 0.2,
                amount_of_undiluted_herbicide_used: 0.002
              }
            ],
            area_of_specie: 25,
            area_treated_ha: 0.0031,
            area_treated_sqm: 31.25,
            percent_area_covered: 18.9,
            amount_of_mix_used: 1.25
          }
        ])
      );
    });
  });
});
