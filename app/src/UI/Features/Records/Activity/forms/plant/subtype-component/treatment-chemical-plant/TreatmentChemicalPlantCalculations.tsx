import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { ChemTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import AdvisoryMessage from 'UI/Features/Records/Activity/forms/common/AdvisoryMessage/AdvisoryMessage';
import {
  ApplicationCalculationVariables,
  DilutionCalculationVariables,
  mSpecie_mLGHerb_spray_usingProdAppRate,
  mSpecie_sGHerb_spray_usingDilutionPercent,
  mSpecie_sGHerb_spray_usingProdAppRate,
  mSpecie_sLHerb_spray_usingDilutionPercent,
  mSpecie_sLHerb_spray_usingProdAppRate,
  sSpecie_sLHerb_direct_usingDilutionPercent
} from './calculations';
import './treatmentChemicalPlantCalculations.css';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { Debug } from 'UI/Reusable/Predicates/Debug';

enum CalculationType {
  Dilution = 'Dilution',
  ApplicationRate = 'Product Application Rate'
}
const TreatmentChemicalPlantCalculations = () => {
  const columnLabelMap = {
    herbicide: 'Herbicide #',
    dilution: 'Dilution',
    invasive_plant: 'Plant Code',
    amount_of_mix_used: 'Mix Used (L)',
    area_treated_sqm: 'Area Treated',
    percentage_area_covered: 'Area Covered',
    undiluted_herbicide_used_l: 'Undiluted Herbicide Used',
    product_application_rate: 'Product Application Rate'
  } as const;

  /**
   * @desc Coerce keys in calculation object to readable column header.
   * @param key Calculation Object Key
   */
  const columnKeyToLabel = (key: string) => columnLabelMap[key] ?? key;
  /**
   * @desc Format Column Values to more readable formats based on column.
   */
  const formattedColumn = (value: string | number, type?: keyof typeof columnLabelMap) => {
    switch (type) {
      case 'percentage_area_covered':
        return <span className={Number(value) > 100 ? 'deep-red' : ''}>{value.toLocaleString()}%</span>;
      case 'area_treated_sqm':
        return `${value.toLocaleString()}m²`;
      case 'amount_of_mix_used':
      case 'undiluted_herbicide_used_l':
        return `${value}L`;
      default:
        return value;
    }
  };
  const performCalculation = (): string | Array<object> => {
    const invalidScenario = 'The Information provided is an invalid scenario';
    const NUM_INVASIVE_PLANTS = plants_treated.length;
    const NUM_HERBICIDES = herbicide.length;

    if (!NUM_HERBICIDES || !NUM_INVASIVE_PLANTS) return 'Violation: Missing Herbicides and/or Invasive Plants';

    const isMultipleHerbicides = NUM_HERBICIDES > 1;
    const isMultiplePlants = NUM_INVASIVE_PLANTS > 1;

    if (tank_mix && !isMultipleHerbicides) return 'Violation: Tank mix requires multiple herbicides';
    if (tank_mix && isMultipleHerbicides) {
      return mSpecie_mLGHerb_spray_usingProdAppRate(
        area_m,
        amount_mix_used_l,
        delivery_rate,
        plants_treated,
        herbicide
      );
    }
    if (isMultipleHerbicides) return 'Violation: Only tank mix may have multiple herbicides.';

    const { type: herbicide_type, application_rate, name: herbicide_name } = herbicide[0];
    const applicationMethod = (() => {
      const isSprayMethod = codes.ChemicalApplicationMethodSprayCode.some(({ code }) => code === application_method);
      if (isSprayMethod) return 'Spray';
      const isDirectMethod = codes.ChemicalApplicationMethodDirectCode.some(({ code }) => code === application_method);
      if (isDirectMethod) return 'Direct';
    })();

    const isHerbicideLiquid = herbicide_type === 'liquid';
    const isHerbicideSolid = herbicide_type === 'granular';
    const isApplicationCalculation = calculation_type === CalculationType.ApplicationRate;
    const isDilutionCalculation = calculation_type === CalculationType.Dilution;

    // Build a payload on type of calculation about to be performed
    const calculationPayload: ApplicationCalculationVariables | DilutionCalculationVariables = (() => {
      if (isApplicationCalculation) {
        return {
          area_m,
          amount_mix_used_l,
          plants_treated,
          herbicide_name,
          product_application_rate_lha: application_rate,
          delivery_rate_of_mix: delivery_rate
        } satisfies ApplicationCalculationVariables;
      } else if (isDilutionCalculation) {
        return {
          area_m: area_m,
          amount_mix_used_l: amount_mix_used_l,
          dilution_percent: dilution_percent,
          area_treated_sqm: area_treated_sqm,
          plants_treated: plants_treated,
          herbicide_name: herbicide_name
        } satisfies DilutionCalculationVariables;
      }
      throw new Error(invalidScenario);
    })();

    if (applicationMethod === 'Direct' && isHerbicideLiquid && isDilutionCalculation && !isMultiplePlants) {
      return sSpecie_sLHerb_direct_usingDilutionPercent(calculationPayload as DilutionCalculationVariables);
    } else if (applicationMethod !== 'Spray') {
      return invalidScenario; // Early Exit, avoid checking Application Method === Spray for every remaining case
    } else if (isHerbicideLiquid && isApplicationCalculation) {
      return mSpecie_sLHerb_spray_usingProdAppRate(calculationPayload as ApplicationCalculationVariables);
    } else if (isHerbicideLiquid && isDilutionCalculation) {
      return mSpecie_sLHerb_spray_usingDilutionPercent(calculationPayload as DilutionCalculationVariables);
    } else if (isHerbicideSolid && isApplicationCalculation) {
      return mSpecie_sGHerb_spray_usingProdAppRate(calculationPayload as ApplicationCalculationVariables);
    } else if (isHerbicideSolid && isDilutionCalculation) {
      return mSpecie_sGHerb_spray_usingDilutionPercent(calculationPayload as DilutionCalculationVariables);
    }
    return invalidScenario;
  };

  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const { control, watch } = useFormContext<ChemTreatment>();

  const {
    tank_mix,
    application_method,
    calculation_type,
    herbicide,
    plants_treated,
    amount_mix_used_l,
    dilution_percent,
    area_treated_sqm,
    delivery_rate
  } = useWatch<ChemTreatment>({
    control,
    name: 'subtype_data.treatment_context'
  });
  const area_m = watch('area_m');
  const [violation, setViolation] = useState<string>('');

  const calculations: Array<object> = useMemo(() => {
    try {
      setViolation('');
      const calculations = performCalculation();
      if (!calculations) return [];
      else if (typeof calculations === 'string') {
        setViolation(calculations);
        return [];
      }
      const areMissingValuesPresent = calculations.some((c) =>
        Object.values(c).some(
          (v) => typeof v === 'number' && (Number.isNaN(v) || !Number.isFinite(v)) // Parse NaN and infinity values
        )
      );
      if (areMissingValuesPresent) setViolation('Violation: Calculation fields are missing or invalid.');
      return calculations as Array<object>;
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [
    area_m,
    tank_mix,
    application_method,
    calculation_type,
    herbicide,
    plants_treated,
    amount_mix_used_l,
    dilution_percent,
    area_treated_sqm,
    delivery_rate
  ]);

  return (
    <Fieldset label={'Calculations'}>
      {typeof calculations !== 'string' && calculations.length > 0 && (
        <div id="calculation-table">
          {violation ? (
            <AdvisoryMessage text={violation} />
          ) : (
            <div className="wrapper">
              <table>
                <thead>
                  <tr>
                    {Object.keys(calculations[0]).map((key) => (
                      <th style={{ textTransform: 'capitalize' }} key={key}>
                        {columnKeyToLabel(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calculations.map((c, index) => (
                    <tr key={index}>
                      {Object.entries(c).map(([k, v]) => (
                        <td key={k}>{formattedColumn(v, k as keyof typeof columnLabelMap)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <Debug>
        <Accordion title={'JSON Format - Calculations'}>
          <pre style={{ textAlign: 'left' }}>{JSON.stringify(calculations, null, 2)}</pre>
        </Accordion>
      </Debug>
    </Fieldset>
  );
};

export default TreatmentChemicalPlantCalculations;
