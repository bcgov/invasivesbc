from pydantic import TypeAdapter
from typing import List, TypedDict
from api.protocol.activity.validators.code_validation import (
    ChemicalApplicationMethodDirectCodeType,
)

HECTARE_TO_SQM = 10000


def trunc(value: float) -> float:
    return round(value, 10)


class Plant(TypedDict):
    invasive_plant: str
    percent_covered: float


class Herbicide(TypedDict):
    name: str
    type: str
    application_rate: float


class DilutionPayload(TypedDict):
    area_m: float
    amount_mix_used_l: float
    dilution_percent: float
    area_treated_sqm: float
    plants_treated: List[Plant]
    herbicide_name: str


class ApplicationRatePayload(TypedDict):
    area_m: float
    amount_mix_used_l: float
    plants_treated: List[Plant]
    herbicide_name: str
    product_application_rate_lha: float
    delivery_rate_of_mix: float


class TankMixPayload(TypedDict):
    area_m: float
    amount_mix_used_l: float
    delivery_rate: float
    plants_treated: List[Plant]
    herbicide: List[Herbicide]


class CalculationResponseValues(TypedDict):
    invasive_plant: str
    herbicide_name: str
    amount_of_mix_used: float
    dilution: float
    area_treated_sqm: float
    undiluted_herbicide_used_l: float
    percentage_area_covered: float


def get_chem_calculation_results(treatment_context, area_m):
    c = treatment_context
    invalid_scenario = "The information provided is an invalid scenario"
    NUM_INVASIVE_PLANTS = len(c.plants_treated)
    NUM_HERBICIDES = len(c.herbicide)

    if NUM_HERBICIDES == 0 or NUM_INVASIVE_PLANTS == 0:
        raise ValueError("Missing Herbicides and/or Invasive Plants")

    IS_MULTIPLE_HERBICIDES = NUM_HERBICIDES > 1

    if c.tank_mix and IS_MULTIPLE_HERBICIDES:
        return mSpecie_mLGHerb_spray_usingProdAppRate(
            {
                "area_m": area_m,
                "amount_mix_used_l": c.amount_mix_used_l,
                "delivery_rate": c.delivery_rate,
                "plants_treated": c.plants_treated,
                "herbicide": c.herbicide,
            }
        )
    elif c.tank_mix and not IS_MULTIPLE_HERBICIDES:
        raise ValueError("Tank mix required multiple herbicides")
    elif IS_MULTIPLE_HERBICIDES:
        raise ValueError("Non-Tank mix treatments cannot use multiple Herbicides")

    h = c.herbicide[0]
    IS_HERBICIDE_LIQUID = h.type == "liquid"
    IS_HERBICIDE_SOLID = h.type == "granular"

    IS_APPLICATION_CALCULATION = c.calculation_type == "PAR"
    IS_DILUTION_CALCULATION = c.calculation_type == "D"
    try:
        IS_DIRECT_APPLICATION = bool(
            TypeAdapter(ChemicalApplicationMethodDirectCodeType).validate_python(
                c.application_method
            )
        )
    except:
        IS_DIRECT_APPLICATION = False

    if IS_APPLICATION_CALCULATION:
        calculation_payload = {
            "area_m": area_m,
            "amount_mix_used_l": c.amount_mix_used_l,
            "plants_treated": c.plants_treated,
            "herbicide_name": h.name,
            "product_application_rate_lha": h.application_rate,
            "delivery_rate_of_mix": c.delivery_rate,
        }
    elif IS_DILUTION_CALCULATION:
        calculation_payload = {
            "area_m": area_m,
            "amount_mix_used_l": c.amount_mix_used_l,
            "dilution_percent": c.dilution_percent,
            "area_treated_sqm": c.area_treated_sqm,
            "plants_treated": c.plants_treated,
            "herbicide_name": h.name,
        }
    else:
        raise ValueError(invalid_scenario)

    if IS_DIRECT_APPLICATION and IS_HERBICIDE_LIQUID and IS_DILUTION_CALCULATION:
        return "mSpecie_sLHerb_spray_usingDilutionPercent"
    elif IS_DIRECT_APPLICATION:
        raise ValueError("Invalid Scenario Provided")
    elif IS_HERBICIDE_LIQUID and IS_APPLICATION_CALCULATION:
        return mSpecie_sLHerb_spray_usingProdAppRate(calculation_payload)
    elif IS_HERBICIDE_LIQUID and IS_DILUTION_CALCULATION:
        return mSpecie_sLHerb_spray_usingDilutionPercent(calculation_payload)
    elif IS_HERBICIDE_SOLID and IS_APPLICATION_CALCULATION:
        return mSpecie_sGHerb_spray_usingProdAppRate(calculation_payload)
    elif IS_HERBICIDE_SOLID and IS_DILUTION_CALCULATION:
        return mSpecie_sGHerb_spray_usingDilutionPercent(calculation_payload)


def mSpecie_sLHerb_spray_usingProdAppRate(
    params: ApplicationRatePayload,
) -> List[CalculationResponseValues]:
    area_m = params.get("area_m")
    product_application_rate_lha = params.get("product_application_rate_lha")
    amount_mix_used_l = params.get("amount_mix_used_l")
    delivery_rate_of_mix = params.get("delivery_rate_of_mix")
    plants_treated = params.get("plants_treated", [])
    herbicide_name = params.get("herbicide_name")

    dilution = (product_application_rate_lha / delivery_rate_of_mix) * 100

    results = []

    for plant in plants_treated:
        percent_covered = plant.percent_covered
        amount_of_mix_used = trunc(amount_mix_used_l * (percent_covered / 100))
        area_treated_hectares = (
            (amount_mix_used_l / delivery_rate_of_mix) * percent_covered
        ) / 100
        area_treated_by_plant = area_treated_hectares * HECTARE_TO_SQM
        percentage_area_covered = trunc((area_treated_by_plant / area_m) * 100)
        undiluted_herbicide_used_l = trunc(
            (dilution / 100) * amount_mix_used_l * (percent_covered / 100)
        )
        results.append(
            {
                "invasive_plant": plant.invasive_plant,
                "herbicide_name": herbicide_name,
                "amount_of_mix_used": amount_of_mix_used,
                "dilution": trunc(dilution),
                "area_treated_sqm": trunc(area_treated_hectares * HECTARE_TO_SQM),
                "undiluted_herbicide_used_l": undiluted_herbicide_used_l,
                "percentage_area_covered": percentage_area_covered,
            }
        )

    return results


def mSpecie_sLHerb_spray_usingDilutionPercent(
    params: DilutionPayload,
) -> List[CalculationResponseValues]:
    dilution_percent = params.get("dilution_percent")
    area_treated_sqm = params.get("area_treated_sqm")
    area_m = params.get("area_m", 0)
    amount_mix_used_l = params.get("amount_mix_used_l")
    herbicide_name = params.get("herbicide")
    results = []

    for plant in params.get("plants_treated", []):
        plant_area_treated_sqm = area_treated_sqm * plant.percent_covered / 100
        percentage_area_covered = trunc((plant_area_treated_sqm / area_m) * 100)
        undiluted_herbicide_used_l = trunc(
            (dilution_percent / 100) * amount_mix_used_l * (plant.percent_covered / 100)
        )
        results.append(
            {
                "invasive_plant": plant.invasive_plant,
                "herbicide_name": herbicide_name,
                "area_treated_sqm": plant_area_treated_sqm,
                "undiluted_herbicide_used_l": undiluted_herbicide_used_l,
                "percentage_area_covered": percentage_area_covered,
            }
        )
    return results


def mSpecie_sGHerb_spray_usingProdAppRate(
    p: ApplicationRatePayload,
) -> List[CalculationResponseValues]:
    product_application_rate_lha = p.get("product_application_rate_lha")
    delivery_rate_of_mix = p.get("delivery_rate_of_mix")
    dilution = (product_application_rate_lha / 1000 / delivery_rate_of_mix) * 100
    area_m = p.get("area_m")
    amount_mix_used_l = p.get("amount_mix_used_l")
    herbicide_name = p.get("herbicide_name")

    results = []

    for plant in p.get("plants_treated", []):
        amount_of_mix_used = amount_mix_used_l * (plant.percent_covered / 100)
        area_treated_sqm = (
            (amount_mix_used_l / delivery_rate_of_mix) * plant.percent_covered / 100
        ) * HECTARE_TO_SQM
        percentage_area_covered = trunc((area_treated_sqm / area_m) * 100)
        undiluted_herbicide_used_l = trunc(
            (dilution / 100) * amount_mix_used_l * (plant.percent_covered / 100)
        )
        results.append(
            {
                "invasive_plant": plant.invasive_plant,
                "herbicide_name": herbicide_name,
                "amount_of_mix_used": trunc(amount_of_mix_used),
                "product_application_rate": product_application_rate_lha,
                "dilution": trunc(dilution),
                "area_treated_sqm": trunc(area_treated_sqm),
                "undiluted_herbicide_used_l": undiluted_herbicide_used_l,
                "percentage_area_covered": percentage_area_covered,
            }
        )
    return results


def mSpecie_sGHerb_spray_usingDilutionPercent(
    p: DilutionPayload,
) -> List[CalculationResponseValues]:
    area_m = p.get("area_m")
    amount_mix_used_l = p.get("amount_mix_used_l")
    dilution_percent = p.get("dilution_percent")
    area_treated_sqm = p.get("area_treated_sqm")
    herbicide_name = p.get("herbicide_name")

    results = []
    for plant in p.get("plants_treated"):
        area_treated_by_plant = area_treated_sqm * (plant.percent_covered / 100)
        percentage_area_covered = trunc((area_treated_by_plant / area_m) * 100)
        undiluted_herbicide_used_l = trunc(
            (dilution_percent / 100) * amount_mix_used_l * (plant.percent_covered / 100)
        )
        results.append(
            {
                "invasive_plant": plant.invasive_plant,
                "herbicide_name": herbicide_name,
                "area_treated_sqm": trunc(area_treated_by_plant),
                "undiluted_herbicide_used_l": undiluted_herbicide_used_l,
                "percentage_area_covered": percentage_area_covered,
            }
        )
    return results


def mSpecie_mLGHerb_spray_usingProdAppRate(
    p: TankMixPayload,
) -> List[CalculationResponseValues]:
    area_m = p.get("area_m")
    amount_mix_used_l = p.get("amount_mix_used_l")
    delivery_rate = p.get("delivery_rate")

    results = []
    for plant in p.get("plants_treated"):
        area_treated_sqm = (
            (amount_mix_used_l / delivery_rate)
            * (plant.percent_covered / 100)
            * HECTARE_TO_SQM
        )
        area_covered_pct = (area_treated_sqm / area_m) * 100

        for h in p.get("herbicide"):
            if h.type == "granular":
                dilution = (h.application_rate / 1000 / delivery_rate) * 100
            elif h.type == "liquid":
                dilution = (h.application_rate / delivery_rate) * 100
            else:
                raise ValueError("Herbicide has an undefined type associated with it.")

            undiluted_herbicide_used_l = (
                (dilution / 100) * amount_mix_used_l * plant.percent_covered
            ) / 100
            results.append(
                {
                    "invasive_plant": plant.invasive_plant,
                    "herbicide_name": h.name,
                    "product_application_rate": h.application_rate,
                    "dilution": trunc(dilution),
                    "area_treated_sqm": trunc(area_treated_sqm),
                    "undiluted_herbicide_used_l": trunc(undiluted_herbicide_used_l),
                    "percentage_area_covered": trunc(area_covered_pct),
                }
            )
    return results
