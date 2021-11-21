export interface IGeneralFields {
  application_start_time?: Date;
  invasive_plants?: IInvasivePlant[];
  tank_mix?: boolean;
  chemical_application_method?: string;
  herbicides?: IHerbicide[];
  tank_mix_object?: ITankMix;
}

export interface IInvasivePlant {
  invasive_plant_code: string | null;
  percent_area_covered?: number;
}

export interface ITankMix {
  calculation_type?: string;
  herbicides?: IHerbicide[];
  amount_of_mix?: number;
  delivery_rate_of_mix?: number;
  area_treated_sqm?: number;
}

export interface IHerbicide {
  herbicide_type_code?: string;
  herbicide_code?: string;
  application_rate?: number; //only if in tank
  calculation_type?: string; //only if NOT in tank
  amount_of_mix?: number;
  dilution?: number;
  area_treated_sqm?: number;
  delivery_rate_of_mix?: number;
  product_application_rate?: number;
}
