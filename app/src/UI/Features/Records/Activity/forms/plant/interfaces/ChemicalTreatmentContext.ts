interface BaseChemicalContext {
  plants_treated: Array<{
    invasive_plant: string;
    percent_covered: number;
  }>;
  tank_mix: boolean;
  calculation_type: string;
  application_method: string;
}

interface BaseHerbicide {
  type: 'granular' | 'liquid' | '';
  name: string;
}
interface ApplicationRateHerbicide extends BaseHerbicide {
  application_rate: number;
}
interface ProductApplicationRate {
  herbicide: Array<ApplicationRateHerbicide>;
  delivery_rate: number;
  application_rate: number;
  amount_mix_used_l: number;
}

interface ProductDilutionRate {
  herbicide: Array<BaseHerbicide>;
  amount_mix_used_l: number;
  dilution_percent: number;
  area_treated_sqm: number;
}
interface TankMixChemicalContext extends BaseChemicalContext, ProductApplicationRate {
  tank_mix: true;
}
interface ChemicalContextDilution extends BaseChemicalContext, ProductDilutionRate {
  tank_mix: false;
}
interface ChemicalContextApplicationRate extends BaseChemicalContext, ProductApplicationRate {
  tank_mix: false;
}

type ChemicalTreatmentContext =
  | BaseChemicalContext
  | TankMixChemicalContext
  | ChemicalContextDilution
  | ChemicalContextApplicationRate;

export type {
  ChemicalTreatmentContext,
  TankMixChemicalContext,
  ChemicalContextDilution,
  ChemicalContextApplicationRate
};
