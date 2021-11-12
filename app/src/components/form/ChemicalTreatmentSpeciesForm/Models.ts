export interface IGeneralFields {
  application_start_time?: Date;
  species_list?: ISpecies[];
  tank_mix?: boolean;
  chemical_application_method?: string;
  herbicides_list?: IHerbicide[];
}

export interface ISpecies {
  invasive_plant_code: string | null;
  percent_area_covered?: number;
}

export interface ITankMix {
  calculation_type?: string;
  herbicides_list?: IHerbicide[];
  calculation_fields: ICalculationUsingDilution | ICalculationUsingProdAppRate;
}

export interface IHerbicide {
  herbicide_type?: string;
  herbicide?: string;
  product_application_rate?: number; //only if in tank
  calculation_type?: string; //only if NOT in tank
  calculation_fields?: ICalculationUsingDilution | ICalculationUsingProdAppRate; //only if NOT in tank
}

export interface ICalculationUsingDilution {
  amount_of_mix: number;
  dilution: number;
  area_treated_sqm: number;
}

export interface ICalculationUsingProdAppRate {
  amount_of_mix: number;
  delivery_rate_of_mix: number;
  product_application_rate: number;
}
