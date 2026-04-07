from typing import cast

from django.db.models import Model
from rich.pretty import pprint

from api.legacy_db.mappings.participants import add_persons
from api.legacy_db.mappings.wells import add_well_information
from api.legacy_db.model_serializer import (
    LegacyActivity,
    LegacyChemTreatmentHerbicideD,
    LegacyChemTreatmentHerbicidePAR,
    LegacyChemicalTreatmentTankMixObjectPAR,
)
from api.models.activity import (
    Activity,
    ChemicalTreatmentContext,
    ActivityDataRecord,
    ChemicalTreatmentDetails,
    Herbicide,
    ActivitySubtypes,
    ChemicalTreatmentAquaticInvasivePlantRecord,
    ChemicalTreatmentTerrestrialInvasivePlantRecord,
    ChemicalTreatmentCalculationResultsRecord,
    ChemicalTreatmentCalculationResultsPerPlantRecord,
    ChemicalTreatmentCalculationResultsPerPlantHerbicideRecord,
    ChemicalTreatmentTankMix,
    ChemicalTreatmentTankMixHerbicide,
)
from api.models.codes import (
    PestManagementPlan,
    WindDirectionCode,
    ChemicalPrecautionaryStatement,
    HerbicideApplicationMethodCode,
    HerbicideTypeCode,
    LiquidHerbicideCode,
    GranularHerbicideCode,
    TerrestrialPlantCode,
    AquaticPlantCode,
)


def add_chemical_treatment_details(new: Activity, old: LegacyActivity):
    st = old.activity_payload.form_data.activity_subtype_data
    d = st.chemical_treatment_details
    if d is None:
        raise ValueError("Missing treatment details")

    adr = ActivityDataRecord.objects.create(activity=new)

    ChemicalTreatmentDetails.objects.create(
        activity_data_record=adr,
        tank_mix=d.tank_mix,
        legacy_object_had_error_flag_set=d.errors if d.errors is not None else False,
        skip_application_rate_validation=d.skipAppRateValidation,
        chemical_application_method=HerbicideApplicationMethodCode.objects.get(
            code=d.chemical_application_method
        ),
    )

    if d.tank_mix_object is not None and d.tank_mix is True:
        if new.migration_remarks == "":
            new.migration_remarks = ""

        if isinstance(d.tank_mix_object, LegacyChemicalTreatmentTankMixObjectPAR):
            ChemicalTreatmentTankMix.objects.create(
                activity_data_record=adr,
                calculation_type=d.tank_mix_object.calculation_type,
                amount_of_mix=d.tank_mix_object.amount_of_mix,
                delivery_rate_of_mix=d.tank_mix_object.delivery_rate_of_mix,
            )
            if d.tank_mix_object.herbicides is not None:
                for h in d.tank_mix_object.herbicides:
                    ChemicalTreatmentTankMixHerbicide.objects.create(
                        activity_data_record=adr,
                        index=h.index,
                        herbicide_type=HerbicideTypeCode.objects.get(
                            code=h.herbicide_type_code
                        ),
                        liquid_herbicide=(
                            LiquidHerbicideCode.objects.get(code=h.herbicide_code)
                            if h.herbicide_code is not None
                            and h.herbicide_type_code == "L"
                            else None
                        ),
                        granular_herbicide=(
                            GranularHerbicideCode.objects.get(code=h.herbicide_code)
                            if h.herbicide_code is not None
                            and h.herbicide_type_code == "G"
                            else None
                        ),
                        product_application_rate=h.product_application_rate,
                        product_application_rate_calculated=h.product_application_rate_calculated,
                    )
        else:
            new.migration_remarks += (
                "Unknown tank mix type, skipping tank mix inclusion"
            )

    if d.calculation_results is not None:
        ChemicalTreatmentCalculationResultsRecord.objects.create(
            activity_data_record=adr,
            calculation_type=d.calculation_results.calculation_type,
            area_treated_sqm=d.calculation_results.area_treated_sqm,
            percent_area_covered=d.calculation_results.percent_area_covered,
            amount_of_undiluted_herbicide_used_liters=d.calculation_results.amount_of_undiluted_herbicide_used_liters,
            dilution=d.calculation_results.dilution,
        )
        if d.calculation_results.invasive_plants is not None:
            for p in d.calculation_results.invasive_plants:
                ChemicalTreatmentCalculationResultsPerPlantRecord.objects.create(
                    activity_data_record=adr,
                    index=p.index,
                    area_treated_sqm=p.area_treated_sqm,
                    percent_area_covered=p.percent_area_covered,
                    amount_of_undiluted_herbicide_used_liters=p.amount_of_undiluted_herbicide_used_liters,
                )
                if p.herbicides is not None:
                    for h in p.herbicides:
                        ChemicalTreatmentCalculationResultsPerPlantHerbicideRecord.objects.create(
                            activity_data_record=adr,
                            herbicide_index=h.herbIndex,
                            plant_index=h.plantIndex,
                            dilution=h.dilution,
                            amount_of_undiluted_herbicide_used_liters=h.amount_of_undiluted_herbicide_used_liters,
                            product_application_rate=h.product_application_rate,
                        )

    if d.invasive_plants is not None:
        for p in d.invasive_plants:
            if (
                old.activity_subtype
                == ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial
            ):
                ChemicalTreatmentTerrestrialInvasivePlantRecord.objects.create(
                    activity_data_record=adr,
                    index=p.index,
                    percent_area_covered=(
                        p.percent_area_covered
                        if p.percent_area_covered is not None
                        else None
                    ),
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=p.invasive_plant_code
                    ),
                )
            if (
                old.activity_subtype
                == ActivitySubtypes.Treatment_Chemical_Plant_Aquatic
            ):
                ChemicalTreatmentAquaticInvasivePlantRecord.objects.create(
                    activity_data_record=adr,
                    index=p.index,
                    percent_area_covered=(
                        p.percent_area_covered
                        if p.percent_area_covered is not None
                        else None
                    ),
                    invasive_plant=AquaticPlantCode.objects.get(
                        code=p.invasive_plant_code
                    ),
                )

    if d.herbicides is not None:
        for h in d.herbicides:
            extra = {}
            if isinstance(h, LegacyChemTreatmentHerbicideD):
                extra = {
                    "area_treated_sqm": h.area_treated_sqm,
                    "dilution": h.dilution,
                    "amount_of_mix": h.amount_of_mix,
                }
            if isinstance(h, LegacyChemTreatmentHerbicidePAR):
                extra = {
                    "product_application_rate": h.product_application_rate,
                    "product_application_rate_calculated": h.product_application_rate_calculated,
                    "delivery_rate_of_mix": h.delivery_rate_of_mix,
                }
            Herbicide.objects.create(
                activity_data_record=adr,
                index=h.index,
                calculation_type=h.calculation_type,
                herbicide_type=HerbicideTypeCode.objects.get(
                    code=h.herbicide_type_code
                ),
                liquid_herbicide=(
                    LiquidHerbicideCode.objects.get(code=h.herbicide_code)
                    if h.herbicide_code is not None and h.herbicide_type_code == "L"
                    else None
                ),
                granular_herbicide=(
                    GranularHerbicideCode.objects.get(code=h.herbicide_code)
                    if h.herbicide_code is not None and h.herbicide_type_code == "G"
                    else None
                ),
                **extra
            )


def add_chemical_treatment_context(new: Activity, old: LegacyActivity):
    if (
        old.activity_payload.form_data.activity_subtype_data.Pest_Injury_Threshold_Determination
        is None
    ):
        if new.migration_remarks == "":
            new.migration_remarks = ""
        new.migration_remarks += "Legacy Activity has no Pest Injury Threshold Determination, assuming False\n"

    adr = ActivityDataRecord.objects.create(activity=new)
    st = old.activity_payload.form_data.activity_subtype_data
    tcpi = st.Treatment_ChemicalPlant_Information
    pitd = st.Pest_Injury_Threshold_Determination

    if tcpi is None:
        raise ValueError("Missing required field")

    ChemicalTreatmentContext.objects.create(
        activity_data_record=adr,
        pesticide_use_permit=tcpi.pesticide_use_permit_PUP,
        pest_management_plan=(
            PestManagementPlan.objects.get(code=tcpi.pest_management_plan)
            if tcpi.pest_management_plan is not None
            else None
        ),
        pesticide_employer_code=tcpi.pesticide_employer_code,
        application_start_time=tcpi.application_start_time,
        temperature_c=tcpi.temperature,
        wind_speed_kmh=tcpi.wind_speed,
        wind_direction=WindDirectionCode.objects.get(code=tcpi.wind_direction_code),
        humidity=tcpi.humidity,
        treatment_notice_signs=tcpi.signage_on_site,
        precautionary_statement=(
            ChemicalPrecautionaryStatement.objects.get(
                code=tcpi.precautionary_statement
            )
            if tcpi.precautionary_statement is not None
            and tcpi.precautionary_statement != ""
            else None
        ),
        ntz_reduction=tcpi.ntz_reduction,
        rationale_for_ntz_reduction=tcpi.rationale_for_ntz_reduction,
        additional_unmapped_well_water=tcpi.unmapped_wells,
        pest_injury_threshold_determination=(
            pitd.completed_radio if pitd is not None else False
        ),
    )


def add_subtype_payload_for_plant_terrestrial_chemical_treatment(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)
    add_chemical_treatment_context(new, old)
    add_chemical_treatment_details(new, old)


def add_subtype_payload_for_plant_aquatic_chemical_treatment(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)
    add_chemical_treatment_context(new, old)
    add_chemical_treatment_details(new, old)
