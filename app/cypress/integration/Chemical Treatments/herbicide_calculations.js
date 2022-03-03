// untitled.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
/// <reference types="cypress" />

import {
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
    //SCENARIO #1 =============================================================================

    it('passed scenario #1 -- dilution', function () {
      expect(sSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400).dilution).to.eq(0.5);
    });
    it('passed scenario #1 -- area_treated_hectares', function () {
      expect(sSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400).area_treated_hectares).to.eq(0.0125);
    });
    it('passed scenario #1 -- area_treated_sqm', function () {
      expect(sSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400).area_treated_sqm).to.eq(125);
    });
    it('passed scenario #1 -- percent_area_covered', function () {
      expect(sSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400).percent_area_covered).to.eq(75.7576);
    });
    it('passed scenario #1 -- amount_of_undiluted_herbicide_used_liters', function () {
      expect(sSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400).amount_of_undiluted_herbicide_used_liters).to.eq(
        0.025
      );
    });

    //SCENARIO #2 =============================================================================

    it('passed scenario #2 -- dilution', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).dilution).to.eq(0.5);
    });
    it('passed scenario #2 -- amounts_of_mix_used (specie1)', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).amounts_of_mix_used[0]).to.eq(3.75);
    });
    it('passed scenario #2 -- amounts_of_mix_used (specie2)', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).amounts_of_mix_used[1]).to.eq(1.25);
    });
    it('passed scenario #2 -- areas_treated_hectares (specie1)', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).areas_treated_hectares[0]).to.eq(0.0094);
    });
    it('passed scenario #2 -- areas_treated_hectares (specie2)', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).areas_treated_hectares[1]).to.eq(0.0031);
    });
    it('passed scenario #2 -- areas_treated_sqm (specie1)', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).areas_treated_sqm[0]).to.eq(93.75);
    });
    it('passed scenario #2 -- areas_treated_sqm (specie2)', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).areas_treated_sqm[1]).to.eq(31.25);
    });
    it('passed scenario #2 -- percentages_area_covered (specie1)', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).percentages_area_covered[0]).to.eq(
        56.8182
      );
    });
    it('passed scenario #2 -- percentages_area_covered (specie2)', function () {
      expect(mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).percentages_area_covered[1]).to.eq(
        18.9394
      );
    });
    it('passed scenario #2 -- amounts_of_undiluted_herbicide_used (specie1)', function () {
      expect(
        mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).amounts_of_undiluted_herbicide_used[0]
      ).to.eq(0.0188);
    });
    it('passed scenario #2 -- amounts_of_undiluted_herbicide_used (specie2)', function () {
      expect(
        mSpecie_sLHerb_spray_usingProdAppRate(area, 2, 5, 400, [75, 25]).amounts_of_undiluted_herbicide_used[1]
      ).to.eq(0.0063);
    });

    //SCENARIO #3 =============================================================================

    it('passed scenario #3 -- area_treated_hectares', function () {
      expect(sSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125).area_treated_hectares).to.eq(0.0125);
    });
    it('passed scenario #3 -- percent_area_covered', function () {
      expect(sSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125).percent_area_covered).to.eq(75.7576);
    });
    it('passed scenario #3 -- amount_of_undiluted_herbicide_used_liters', function () {
      expect(
        sSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125).amount_of_undiluted_herbicide_used_liters
      ).to.eq(0.1);
    });

    //SCENARIO #4 =============================================================================
    it('passed scenario #4 -- area_treated_hectares', function () {
      expect(mSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125, [75, 25]).area_treated_hectares).to.eq(0.0125);
    });
    it('passed scenario #4 -- areas_treated_sqm (specie #1)', function () {
      expect(mSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125, [75, 25]).areas_treated_sqm[0]).to.eq(93.75);
    });
    it('passed scenario #4 -- areas_treated_sqm (specie #2)', function () {
      expect(mSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125, [75, 25]).areas_treated_sqm[0]).to.eq(93.75);
    });
    it('passed scenario #4 -- percentages_area_covered (specie #1)', function () {
      expect(mSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125, [75, 25]).percentages_area_covered[0]).to.eq(
        56.8182
      );
    });
    it('passed scenario #4 -- percentages_area_covered (specie #2)', function () {
      expect(mSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125, [75, 25]).percentages_area_covered[1]).to.eq(
        18.9394
      );
    });
    it('passed scenario #4 -- amounts_of_undiluted_herbicide_used (specie #1)', function () {
      expect(
        mSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125, [75, 25]).amounts_of_undiluted_herbicide_used[0]
      ).to.eq(0.075);
    });
    it('passed scenario #4 -- amounts_of_undiluted_herbicide_used (specie #2)', function () {
      expect(
        mSpecie_sLHerb_spray_usingDilutionPercent(area, 5, 2, 125, [75, 25]).amounts_of_undiluted_herbicide_used[1]
      ).to.eq(0.025);
    });

    //SCENARIO #5 =============================================================================
    it('passed scenario #5 -- product_application_rate_lha', function () {
      expect(sSpecie_sGHerb_spray_usingProdAppRate(area, 230, 5, 400).product_application_rate_lha).to.eq(0.23);
    });
    it('passed scenario #5 -- dilution', function () {
      expect(sSpecie_sGHerb_spray_usingProdAppRate(area, 230, 5, 400).dilution).to.eq(0.0575);
    });
    it('passed scenario #5 -- area_treated_hectares', function () {
      expect(sSpecie_sGHerb_spray_usingProdAppRate(area, 230, 5, 400).area_treated_hectares).to.eq(0.0125);
    });
    it('passed scenario #5 -- area_treated_sqm', function () {
      expect(sSpecie_sGHerb_spray_usingProdAppRate(area, 230, 5, 400).area_treated_sqm).to.eq(125);
    });
    it('passed scenario #5 -- percent_area_covered', function () {
      expect(sSpecie_sGHerb_spray_usingProdAppRate(area, 230, 5, 400).percent_area_covered).to.eq(75.7576);
    });
    it('passed scenario #5 -- amount_of_undiluted_herbicide_used_liters', function () {
      expect(sSpecie_sGHerb_spray_usingProdAppRate(area, 230, 5, 400).amount_of_undiluted_herbicide_used_liters).to.eq(
        0.0029
      );
    });

    //SCENARIO #6 =============================================================================
    it('passed scenario #6 -- area_treated_hectares', function () {
      expect(sSpecie_sGHerb_spray_usingDilutionPercent(area, 5, 0.023, 100).area_treated_hectares).to.eq(0.01);
    });
    it('passed scenario #6 -- percent_area_covered', function () {
      expect(sSpecie_sGHerb_spray_usingDilutionPercent(area, 5, 0.023, 100).percent_area_covered).to.eq(60.6061);
    });
    it('passed scenario #6 -- amount_of_undiluted_herbicide_used_liters', function () {
      expect(
        sSpecie_sGHerb_spray_usingDilutionPercent(area, 5, 0.023, 100).amount_of_undiluted_herbicide_used_liters
      ).to.eq(0.0011);
    });

    //SCENARIO #7 =============================================================================

    it('passed scenario #7 -- area_treated_hectares', function () {
      expect(sSpecie_sLHerb_direct_usingDilutionPercent(area, 1, 50, 30).area_treated_hectares).to.eq(0.003);
    });

    it('passed scenario #7 -- percent_area_covered', function () {
      expect(sSpecie_sLHerb_direct_usingDilutionPercent(area, 1, 50, 30).percent_area_covered).to.eq(18.1818);
    });

    it('passed scenario #7 -- amount_of_undiluted_herbicide_used_liters', function () {
      expect(
        sSpecie_sLHerb_direct_usingDilutionPercent(area, 1, 50, 30).amount_of_undiluted_herbicide_used_liters
      ).to.eq(0.5);
    });

    //SCENARIO #8 =============================================================================

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
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].area_of_specie).to.eq(75);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].area_treated_ha).to.eq(0.0094);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].area_treated_sqm).to.eq(93.75);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].percent_area_covered).to.eq(56.8182);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].amount_of_mix_used).to.eq(3.75);
      expect(
        mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].herbicides[0].product_application_rate_lha
      ).to.eq(2);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].herbicides[0].dilution).to.eq(0.5);
      expect(
        mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].herbicides[0]
          .amount_of_undiluted_herbicide_used_liters
      ).to.eq(0.0187);
      expect(
        mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].herbicides[1].product_application_rate_lha
      ).to.eq(0.64);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].herbicides[1].dilution).to.eq(0.16);
      expect(
        mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[0].herbicides[1]
          .amount_of_undiluted_herbicide_used_liters
      ).to.eq(0.006);

      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].area_of_specie).to.eq(25);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].area_treated_ha).to.eq(0.0031);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].area_treated_sqm).to.eq(31.25);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].percent_area_covered).to.eq(18.9394);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].amount_of_mix_used).to.eq(1.25);
      expect(
        mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].herbicides[0].product_application_rate_lha
      ).to.eq(2);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].herbicides[0].dilution).to.eq(0.5);
      expect(
        mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].herbicides[0]
          .amount_of_undiluted_herbicide_used_liters
      ).to.eq(0.0063);
      expect(
        mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].herbicides[1].product_application_rate_lha
      ).to.eq(0.64);
      expect(mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].herbicides[1].dilution).to.eq(0.16);
      expect(
        mSpecie_mLGHerb_spray_usingProdAppRate(area, 5, 400, speciesArr)[1].herbicides[1]
          .amount_of_undiluted_herbicide_used_liters
      ).to.eq(0.002);
    });
  });
});
