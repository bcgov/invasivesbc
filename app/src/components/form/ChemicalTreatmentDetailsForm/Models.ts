export interface IGeneralFields {
  application_start_time?: Date;
  invasive_plants?: ISpecies[];
  tank_mix?: boolean;
  tank_mix_object?: any;
  chemical_application_method?: string;
  herbicides?: IHerbicide[];
}

export interface ISpecies {
  invasive_plant_code: string | null;
  percent_area_covered?: number;
}

export interface ITankMix {
  calculation_type?: string;
  herbicides?: IHerbicide[];
  calculation_fields?: any;
}

export interface IHerbicide {
  herbicide_type_code?: string;
  herbicide_code?: string;
  application_rate?: number; //only if in tank
  calculation_type?: string; //only if NOT in tank
  calculation_fields?: any; //only if NOT in tank
}

export interface ICalculationUsingDilution {
  amount_of_mix?: number;
  dilution?: number;
  area_treated_sqm?: number;
}

export interface ICalculationUsingProdAppRate {
  amount_of_mix?: number;
  delivery_rate_of_mix?: number;
  product_application_rate?: number;
}
