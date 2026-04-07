from api.legacy_db.mappings.participants import add_persons
from api.legacy_db.mappings.waterbody import add_shoreline_types
from api.legacy_db.mappings.wells import add_well_information
from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    TerrestrialPlantMechanicalTreatmentEntry,
    AquaticPlantMechanicalTreatmentEntry,
    ActivityDataRecord,
    AquaticMechanicalAuthorization,
)
from api.models.codes import (
    PlantMechanicalTreatmentMethodCode,
    DisposalMethodCode,
    TerrestrialPlantCode,
    AquaticPlantCode,
)


def add_subtype_payload_for_plant_terrestrial_treatment(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)

    for (
        mt
    ) in (
        old.activity_payload.form_data.activity_subtype_data.Treatment_MechanicalPlant_Information
    ):
        adr = ActivityDataRecord.objects.create(activity=new)
        TerrestrialPlantMechanicalTreatmentEntry.objects.create(
            activity_data_record=adr,
            invasive_plant=TerrestrialPlantCode.objects.get(
                code=mt.invasive_plant_code
            ),
            treated_area_msq=mt.treated_area,
            mechanical_method=PlantMechanicalTreatmentMethodCode.objects.get(
                code=mt.mechanical_method_code
            ),
            disposal_method=DisposalMethodCode.objects.get(
                code=mt.mechanical_disposal_code
            ),
            disposed_material_format=(
                mt.disposed_material.disposed_material_input_format
                if mt.disposed_material is not None
                else None
            ),
            disposed_material_amount=(
                mt.disposed_material.disposed_material_input_number
                if mt.disposed_material is not None
                else None
            ),
        )


def add_subtype_payload_for_plant_aquatic_treatment(new: Activity, old: LegacyActivity):
    add_persons(new, old)
    add_well_information(new, old)
    add_shoreline_types(new, old)

    if (
        old.activity_payload.form_data.activity_subtype_data.Authorization_Infotmation
        is not None
    ):
        adr = ActivityDataRecord.objects.create(activity=new)
        AquaticMechanicalAuthorization.objects.create(
            activity_data_record=adr,
            authorization_information=old.activity_payload.form_data.activity_subtype_data.Authorization_Infotmation.additional_auth_information,
        )

    for (
        mt
    ) in (
        old.activity_payload.form_data.activity_subtype_data.Treatment_MechanicalPlant_Information
    ):
        adr = ActivityDataRecord.objects.create(activity=new)
        AquaticPlantMechanicalTreatmentEntry.objects.create(
            activity_data_record=adr,
            invasive_plant=AquaticPlantCode.objects.get(code=mt.invasive_plant_code),
            treated_area_msq=mt.treated_area,
            mechanical_method=PlantMechanicalTreatmentMethodCode.objects.get(
                code=mt.mechanical_method_code
            ),
            disposal_method=DisposalMethodCode.objects.get(
                code=mt.mechanical_disposal_code
            ),
            disposed_material_format=(
                mt.disposed_material.disposed_material_input_format
                if mt.disposed_material is not None
                else None
            ),
            disposed_material_amount=(
                mt.disposed_material.disposed_material_input_number
                if mt.disposed_material is not None
                else None
            ),
        )
