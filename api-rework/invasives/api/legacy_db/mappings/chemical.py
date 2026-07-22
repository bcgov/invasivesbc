from typing import cast

from django.db.models import Model
from rich.pretty import pprint

from api.legacy_db.mappings.participants import add_persons
from api.legacy_db.mappings.wells import add_well_information
from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    ActivitySubtypes,
    ChemTreatmentContext,
    ChemicalTreatmentContext,
    LiquidHerbicideEntry,
    GranularHerbicideEntry,
    ChemPlantEntryAquatic,
    ChemPlantEntryTerrestrial,
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

    is_tank_mix = d.tank_mix is not None and d.tank_mix
    plant_list = d.invasive_plants
    if is_tank_mix:
        herbicide_list = d.tank_mix_object.herbicides
        calculation_type = d.tank_mix_object.calculation_type
        amount_of_mix_used_l = d.tank_mix_object.amount_of_mix
        delivery_rate_of_mix = d.tank_mix_object.delivery_rate_of_mix
        area_treated_sqm = None
        dilution = None
    else:
        h = d.herbicides[0]
        herbicide_list = d.herbicides
        calculation_type = getattr(h, "calculation_type", None)
        area_treated_sqm = getattr(h, "area_treated_sqm", None)
        amount_of_mix_used_l = getattr(h, "amount_of_mix", None)
        delivery_rate_of_mix = getattr(h, "delivery_rate_of_mix", None)
        dilution = getattr(h, "dilution", None)

    application_method = HerbicideApplicationMethodCode.objects.get(
        code=d.chemical_application_method
    )
    ChemTreatmentContext.objects.create(
        activity_data_record=adr,
        application_method=application_method,
        tank_mix=is_tank_mix,
        calculation_type=calculation_type,
        area_treated_sqm=area_treated_sqm,
        amount_mix_used_l=amount_of_mix_used_l,
        delivery_rate=delivery_rate_of_mix,
        dilution_percent=dilution,
    )

    for h in herbicide_list:
        application_rate = getattr(h, "product_application_rate", None)
        type = h.herbicide_type_code
        type_code = HerbicideTypeCode.objects.get(code=h.herbicide_type_code)

        if type == "G":
            model = GranularHerbicideEntry
            code_model = GranularHerbicideCode
        elif type == "L":
            model = LiquidHerbicideEntry
            code_model = LiquidHerbicideCode

        code = (
            code_model.objects.get(code=h.herbicide_code)
            if h.herbicide_code is not None
            else None
        )
        model.objects.create(
            activity_data_record=adr,
            type=type_code,
            name=code,
            product_application_rate=application_rate,
        )

    for p in plant_list:
        if (
            old.activity_subtype
            == ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial
        ):
            code_model = TerrestrialPlantCode
            model = ChemPlantEntryTerrestrial

        elif old.activity_subtype == ActivitySubtypes.Treatment_Chemical_Plant_Aquatic:
            code_model = AquaticPlantCode
            model = ChemPlantEntryAquatic

        invasive_plant = code_model.objects.get(code=p.invasive_plant_code)

        # When only a single plant was listed, old forms implictly were 100% coverage unless otherwise stated
        HUNDRED_PERCENT = 100
        model.objects.create(
            activity_data_record=adr,
            invasive_plant=invasive_plant,
            percent_covered=(
                p.percent_area_covered
                if p.percent_area_covered is not None
                else HUNDRED_PERCENT
            ),
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


def add_calculation_results(new: Activity, old: LegacyActivity):
    print("UNIMPLEMENTED", "add_calculation_results")


def add_subtype_payload_for_plant_terrestrial_chemical_treatment(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)
    add_chemical_treatment_context(new, old)
    add_chemical_treatment_details(new, old)
    add_calculation_results(new, old)


def add_subtype_payload_for_plant_aquatic_chemical_treatment(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)
    add_chemical_treatment_context(new, old)
    add_chemical_treatment_details(new, old)
    add_calculation_results(new, old)
