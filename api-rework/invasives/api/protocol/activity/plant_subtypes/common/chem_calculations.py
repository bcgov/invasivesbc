"""
Chemical Calculations used for the Exporting of Chemical Treatment records.
Creates a row for every combination of:
    - Jurisdiction
    - Plant
    - Herbicide
In the event of tank mix calculations, some fields are divided evenly by the number of herbicides in the mix to ensure sums are accurate.
"""

from pydantic import TypeAdapter
from typing import List, TypedDict
from api.models.activity import Jurisdiction
from api.models.codes import (
    HerbicideCode,
    HerbicideTypeCode,
)
from api.protocol.activity.validators.code_validation import (
    ChemicalApplicationMethodDirectCodeType,
    JurisdictionCodeType,
)

HECTARE_TO_SQM = 10000


def trunc(value: float) -> float:
    return round(value, 10)


class Jurisdiction(TypedDict):
    jurisdiction: JurisdictionCodeType
    percent_covered: int


class Plant(TypedDict):
    invasive_plant: str
    percent_covered: float


class Herbicide(TypedDict):
    name: str
    type: str
    application_rate: float


class DilutionPayload(TypedDict):
    jurisdictions: List[Jurisdiction]
    area_m: float
    amount_mix_used_l: float
    dilution_percent: float
    area_treated_sqm: float
    plants_treated: List[Plant]
    herbicide_name: HerbicideCode
    herbicide_type: HerbicideTypeCode


class ApplicationRatePayload(TypedDict):
    jurisdictions: List[Jurisdiction]
    area_m: float
    amount_mix_used_l: float
    plants_treated: List[Plant]
    herbicide_name: HerbicideCode
    herbicide_type: HerbicideTypeCode
    product_application_rate_lha: float
    delivery_rate_of_mix: float


class TankMixPayload(TypedDict):
    jurisdictions: List[Jurisdiction]
    area_m: float
    amount_mix_used_l: float
    delivery_rate: float
    plants_treated: List[Plant]
    herbicide: List[Herbicide]


class CalculationResponseValues(TypedDict):
    jurisdiction: JurisdictionCodeType
    jurisdiction_percent: float
    invasive_plant: str
    herbicide_name: HerbicideCode
    herbicide_type: HerbicideTypeCode
    amount_of_mix_used: float
    dilution: float
    area_treated_sqm: float
    undiluted_herbicide_used_l: float
    percentage_area_covered: float


def get_chem_calculation_results(
    treatment_context, area_m, jurisdictions: List[Jurisdiction]
):
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
                "jurisdictions": jurisdictions,
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
    IS_HERBICIDE_LIQUID = h.type.code == "L"
    IS_HERBICIDE_SOLID = h.type.code == "G"

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
            "jurisdictions": jurisdictions,
            "area_m": area_m,
            "amount_mix_used_l": c.amount_mix_used_l,
            "plants_treated": c.plants_treated,
            "herbicide_name": h.name,
            "product_application_rate_lha": h.application_rate,
            "delivery_rate_of_mix": c.delivery_rate,
            "herbicide_type": h.type,
        }
    elif IS_DILUTION_CALCULATION:
        calculation_payload = {
            "jurisdictions": jurisdictions,
            "area_m": area_m,
            "amount_mix_used_l": c.amount_mix_used_l,
            "dilution_percent": c.dilution_percent,
            "area_treated_sqm": c.area_treated_sqm,
            "plants_treated": c.plants_treated,
            "herbicide_name": h.name,
            "herbicide_type": h.type,
        }
    else:
        raise ValueError(invalid_scenario)

    if IS_DIRECT_APPLICATION and IS_HERBICIDE_LIQUID and IS_DILUTION_CALCULATION:
        return mSpecie_sLHerb_spray_usingDilutionPercent(calculation_payload)
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
    # Calculation scenario: 1-2
    area_m = params.get("area_m")
    product_application_rate_lha = params.get("product_application_rate_lha")
    amount_mix_used_l = params.get("amount_mix_used_l")
    delivery_rate_of_mix = params.get("delivery_rate_of_mix")
    dilution_percent = product_application_rate_lha / delivery_rate_of_mix

    results: List[CalculationResponseValues] = []
    for plant in params.get("plants_treated", []):
        plant_percentage = plant.percent_covered / 100
        amount_of_mix_used = trunc(amount_mix_used_l * plant_percentage)
        area_treated_sqm = (
            (amount_mix_used_l / delivery_rate_of_mix)
            * plant_percentage
            * HECTARE_TO_SQM
        )
        undiluted_herbicide_used_l = trunc(
            dilution_percent * amount_mix_used_l * plant_percentage
        )
        percentage_area_covered = area_treated_sqm / area_m * 100

        for j in params.get("jurisdictions", []):
            multiplier = j.percent_covered / 100
            herbicide_name = params.get("herbicide_name")
            herbicide_type = params.get("herbicide_type")
            results.append(
                {
                    "jurisdiction": j.jurisdiction,
                    "jurisdiction_percent": j.percent_covered,
                    "invasive_plant": plant.invasive_plant,
                    "invasive_plant_percent": plant.percent_covered,
                    "herbicide_name": herbicide_name,
                    "herbicide_type": herbicide_type,
                    "product_application_rate": product_application_rate_lha,
                    "amount_of_mix_used": trunc(amount_of_mix_used * multiplier),
                    "dilution": dilution_percent * 100,
                    "area_treated_sqm": trunc(area_treated_sqm * multiplier),
                    "undiluted_herbicide_used_l": undiluted_herbicide_used_l,
                    "percentage_area_covered": trunc(
                        percentage_area_covered * multiplier
                    ),
                }
            )

    return results


def mSpecie_sLHerb_spray_usingDilutionPercent(
    params: DilutionPayload,
) -> List[CalculationResponseValues]:
    # Calculation scenario: 4
    area_treated_sqm = params.get("area_treated_sqm")
    area_m = params.get("area_m", 0)
    amount_mix_used_l = params.get("amount_mix_used_l")
    dilution_percent = params.get("dilution_percent") / 100

    results: List[CalculationResponseValues] = []
    for plant in params.get("plants_treated", []):
        plant_percentage = plant.percent_covered / 100
        plant_area_treated_sqm = area_treated_sqm * plant_percentage
        undiluted_herbicide_used_l = (
            amount_mix_used_l * dilution_percent * plant_percentage
        )
        percentage_area_covered = (plant_area_treated_sqm / area_m) * 100
        for j in params.get("jurisdictions", []):
            multiplier = j.percent_covered / 100
            results.append(
                {
                    "herbicide_type": params.get("herbicide_type"),
                    "herbicide_name": params.get("herbicide_name"),
                    "jurisdiction": j.jurisdiction,
                    "jurisdiction_percent": j.percent_covered,
                    "invasive_plant": plant.invasive_plant,
                    "invasive_plant_percent": plant.percent_covered,
                    "amount_of_mix_used": trunc(
                        (amount_mix_used_l * plant_percentage * multiplier)
                    ),
                    "dilution": trunc(dilution_percent * 100),
                    "area_treated_sqm": trunc(plant_area_treated_sqm),
                    "undiluted_herbicide_used_l": trunc(undiluted_herbicide_used_l),
                    "percentage_area_covered": trunc(percentage_area_covered),
                }
            )

    return results


def mSpecie_sGHerb_spray_usingProdAppRate(
    p: ApplicationRatePayload,
) -> List[CalculationResponseValues]:
    # Calculation scenario: 5
    product_application_rate_lha = p.get("product_application_rate_lha")
    delivery_rate_of_mix = p.get("delivery_rate_of_mix")
    amount_of_mix_used_l = p.get("amount_mix_used_l")
    area_m = p.get("area_m")

    dilution_percent = product_application_rate_lha / 1000 / delivery_rate_of_mix

    results: List[CalculationResponseValues] = []
    for plant in p.get("plants_treated", []):
        plant_percent = plant.percent_covered / 100
        amount_of_mix_used = amount_of_mix_used_l * plant_percent
        area_treated_sqm = (
            (amount_of_mix_used_l / delivery_rate_of_mix)
            * plant_percent
            * HECTARE_TO_SQM
        )
        percentage_area_covered = (area_treated_sqm / area_m) * 100
        undiluted_herbicide_used_l = (
            amount_of_mix_used_l * dilution_percent * plant_percent
        )
        for j in p.get("jurisdictions", []):
            herbicide_name = p.get("herbicide_name")
            herbicide_type = p.get("herbicide_type")
            multiplier = j.percent_covered / 100
            results.append(
                {
                    "jurisdiction": j.jurisdiction,
                    "jurisdiction_percent": j.percent_covered,
                    "invasive_plant": plant.invasive_plant,
                    "invasive_plant_percent": plant.percent_covered,
                    "herbicide_name": herbicide_name,
                    "herbicide_type": herbicide_type,
                    "product_application_rate": product_application_rate_lha,
                    "amount_of_mix_used": trunc(amount_of_mix_used * multiplier),
                    "dilution": trunc(dilution_percent * 100),
                    "area_treated_sqm": trunc(area_treated_sqm * multiplier),
                    "undiluted_herbicide_used_l": trunc(
                        undiluted_herbicide_used_l * multiplier
                    ),
                    "percentage_area_covered": trunc(
                        percentage_area_covered * multiplier
                    ),
                }
            )
    return results


def mSpecie_sGHerb_spray_usingDilutionPercent(
    p: DilutionPayload,
) -> List[CalculationResponseValues]:
    area_m = p.get("area_m")
    amount_mix_used_l = p.get("amount_mix_used_l")
    dilution_percent = p.get("dilution_percent") / 100
    area_treated_sqm = p.get("area_treated_sqm")
    herbicide_name = p.get("herbicide_name")
    herbicide_type = p.get("herbicide_type")
    results: List[CalculationResponseValues] = []

    for plant in p.get("plants_treated"):
        plant_percentage = plant.percent_covered / 100
        amount_mix_used_on_plant = amount_mix_used_l * plant_percentage
        area_treated_by_plant = area_treated_sqm * plant_percentage
        percentage_area_covered = (area_treated_by_plant / area_m) * 100
        undiluted_herbicide_used_l = dilution_percent * amount_mix_used_on_plant

        for j in p.get("jurisdictions", []):
            multiplier = j.percent_covered / 100
            results.append(
                {
                    "jurisdiction": j.jurisdiction,
                    "jurisdiction_percent": j.percent_covered,
                    "invasive_plant": plant.invasive_plant,
                    "invasive_plant_percent": plant.percent_covered,
                    "herbicide_name": herbicide_name,
                    "herbicide_type": herbicide_type,
                    "dilution": dilution_percent * 100,
                    "area_treated_sqm": trunc(area_treated_by_plant * multiplier),
                    "amount_of_mix_used": trunc(amount_mix_used_on_plant * multiplier),
                    "undiluted_herbicide_used_l": trunc(
                        undiluted_herbicide_used_l * multiplier
                    ),
                    "percentage_area_covered": trunc(
                        percentage_area_covered * multiplier
                    ),
                }
            )
    return results


def mSpecie_mLGHerb_spray_usingProdAppRate(
    p: TankMixPayload,
) -> List[CalculationResponseValues]:
    # Calculation scenario: 8-10 (11)
    area_m = p.get("area_m")
    herbicides = p.get("herbicide", [])
    num_herbicides = len(herbicides)
    amount_mix_used_l = p.get("amount_mix_used_l")
    delivery_rate = p.get("delivery_rate")
    results: List[CalculationResponseValues] = []

    for plant in p.get("plants_treated"):
        plant_percent = plant.percent_covered / 100
        plant_name = plant.invasive_plant
        area_treated_sqm = (
            (amount_mix_used_l / delivery_rate) * plant_percent * HECTARE_TO_SQM
        )
        area_covered_pct = (area_treated_sqm / area_m) * 100

        for herbicide in herbicides:
            if herbicide.type.code == "G":
                dilution = herbicide.application_rate / 1000 / delivery_rate
            elif herbicide.type.code == "L":
                dilution = herbicide.application_rate / delivery_rate
            else:
                raise ValueError("Herbicide has an undefined type associated with it.")

            undiluted_herbicide_used_l = dilution * amount_mix_used_l * plant_percent

            for j in p.get("jurisdictions", []):
                multiplier = j.percent_covered / 100
                # Sum fields are divided by the number of herbicides to assure the sum matches correctly
                area_treated_for_result = area_treated_sqm / num_herbicides
                amount_mix_used_for_result = amount_mix_used_l / num_herbicides
                percent_area_covered_for_result = area_covered_pct / num_herbicides
                results.append(
                    {
                        "jurisdiction": j.jurisdiction,
                        "jurisdiction_percent": j.percent_covered,
                        "invasive_plant": plant_name,
                        "invasive_plant_percent": plant.percent_covered,
                        "herbicide_name": herbicide.name,
                        "herbicide_type": herbicide.type,
                        "product_application_rate": herbicide.application_rate,
                        "amount_of_mix_used": trunc(
                            amount_mix_used_for_result * plant_percent * multiplier
                        ),
                        "dilution": trunc(dilution * 100),
                        "area_treated_sqm": trunc(area_treated_for_result * multiplier),
                        "undiluted_herbicide_used_l": trunc(
                            undiluted_herbicide_used_l * multiplier
                        ),
                        "percentage_area_covered": trunc(
                            percent_area_covered_for_result * multiplier
                        ),
                    }
                )
    return results
