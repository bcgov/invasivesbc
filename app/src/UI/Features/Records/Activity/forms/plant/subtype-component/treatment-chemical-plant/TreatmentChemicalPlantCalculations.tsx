import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import { BugReport } from '@mui/icons-material';
import { ActivitySubtypes } from 'sharedAPI';
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
  mSpecie_sLHerb_spray_usingProdAppRate
} from './calculations';
import './treatmentChemicalPlantCalculations.css';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import getDefaultFormState from '../../builders/getDefaultState';

enum CalculationType {
  Dilution = 'Dilution',
  ApplicationRate = 'Product Application Rate'
}
const TreatmentChemicalPlantCalculations = () => {
  const columnLabelMap = {
    herbicide_name: 'Herbicide',
    dilution: 'Dilution',
    invasive_plant: 'Invasive Plant',
    amount_of_mix_used: 'Mix Used',
    area_treated_sqm: 'Area Treated',
    percentage_area_covered: 'Area Covered',
    undiluted_herbicide_used_l: 'Undiluted Herbicide Used',
    product_application_rate: 'Product Application Rate'
  };

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
        return `${value.toLocaleString()}\u00a0m²`; // Whitespace between Value and unit requested.
      case 'amount_of_mix_used':
      case 'invasive_plant': {
        // Convert Plant code to readable title. strip latin from title.
        const plant =
          subtype === ActivitySubtypes.Treatment_Chemical_Plant_Aquatic
            ? (codes.AquaticPlantCode.find(({ code }) => code === value)?.full_name ?? value)
            : (codes.TerrestrialPlantCode.find(({ code }) => code === value)?.full_name ?? value);
        return plant.toString().replace(/\s*\(.*/, '');
      }
      case 'herbicide_name': {
        // Convert Herbicide name to readable title. Strip ingredients / number from title.
        const herbName =
          codes?.LiquidHerbicideCode.find(({ code }) => code === value)?.full_name ??
          codes?.GranularHerbicideCode.find(({ code }) => code === value)?.full_name ??
          value;
        return herbName.toString().replace(/\s*\[.*/, '');
      }
      case 'undiluted_herbicide_used_l':
        return `${value}\u00a0L`; // Whitespace between Value and unit requested.
      default:
        return value;
    }
  };
  const performCalculation = (): string | Array<object> => {
    const invalidScenario = 'The Information provided is an invalid scenario';
    const NUM_INVASIVE_PLANTS = plants_treated.length;
    const NUM_HERBICIDES = herbicide.length;

    if (!NUM_HERBICIDES || !NUM_INVASIVE_PLANTS) throw new Error('Missing Herbicides and/or Invasive Plants');

    const isMultipleHerbicides = NUM_HERBICIDES > 1;
    const isMultiplePlants = NUM_INVASIVE_PLANTS > 1;

    if (tank_mix && !isMultipleHerbicides) throw new Error('Tank mix requires multiple herbicides');
    if (tank_mix && isMultipleHerbicides) {
      return mSpecie_mLGHerb_spray_usingProdAppRate(
        area_m,
        amount_mix_used_l,
        delivery_rate,
        plants_treated,
        herbicide
      );
    }
    if (isMultipleHerbicides) throw new Error('Only tank mix may have multiple herbicides.');

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

    if (applicationMethod === 'Direct' && isHerbicideLiquid && isDilutionCalculation) {
      return mSpecie_sLHerb_spray_usingDilutionPercent(calculationPayload as DilutionCalculationVariables);
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
  const subtype = useSelector((state) => state.ActivityPage.formType);
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
    defaultValue: (getDefaultFormState(subtype) as ChemTreatment).subtype_data.treatment_context, // protect against information missing
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
      if (areMissingValuesPresent) throw new Error('Calculation fields are missing or invalid.');
      return calculations as Array<object>;
    } catch (e) {
      if (e instanceof Error) {
        setViolation(e.toString());
      }
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
      <div id="calculation-table">
        {violation ? (
          <AdvisoryMessage text={violation} />
        ) : (
          <div className="wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(calculations[0] ?? {}).map((key) => (
                    <th key={key}>{columnKeyToLabel(key)}</th>
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
      <Debug>
        <Accordion
          title={
            <>
              <BugReport /> JSON Format - Calculations
            </>
          }
        >
          <pre>{JSON.stringify(calculations, null, 2)}</pre>
        </Accordion>
      </Debug>
    </Fieldset>
  );
};

export default TreatmentChemicalPlantCalculations;
