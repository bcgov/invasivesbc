from api.legacy_db.mappings.wells import add_well_information
from api.legacy_db.model_serializer import (
    LegacyActivity,
    LegacyActivityTerrestrialPlants,
)
from api.models.activity import (
    Activity,
    Participant,
    PretreatmentObservation,
    TerrestrialPlantObservationDetail,
    TerrestrialPlantObservationInfo,
    TerrestrialVoucherSpecimen,
)
from api.models.codes import (
    AspectCode,
    DensityCode,
    DistributionCode,
    PlantLifeStageCode,
    SlopePercentCode,
    SoilTextureCode,
    SpecificUseCode,
    TerrestrialPlantCode,
)
from api.models.enums import ObservationType


def add_voucher_specimen(
    new: Activity,
    old: LegacyActivity,
    plant: LegacyActivityTerrestrialPlants,
):
    TerrestrialVoucherSpecimen.objects.create(
        activity=new,
        date_verified=plant.voucher_specimen_collection_information.date_voucher_verified,
        date_collected=plant.voucher_specimen_collection_information.date_voucher_verified,
        voucher_sample_id=plant.voucher_specimen_collection_information.voucher_sample_id,
        herbarium=plant.voucher_specimen_collection_information.name_of_herbarium,
        completed_by_org=(
            plant.voucher_specimen_collection_information.voucher_verification_completed_by.organization
            if plant.voucher_specimen_collection_information.voucher_verification_completed_by
            is not None
            else None
        ),
        completed_by_person=(
            plant.voucher_specimen_collection_information.voucher_verification_completed_by.person
            if plant.voucher_specimen_collection_information.voucher_verification_completed_by
            is not None
            else None
        ),
        utm_zone=plant.voucher_specimen_collection_information.utm_zone,
        utm_easting=plant.voucher_specimen_collection_information.utm_easting,
        utm_northing=plant.voucher_specimen_collection_information.utm_northing,
        invasive_plant=(
            TerrestrialPlantCode.objects.get(code=plant.invasive_plant_code)
            if plant.invasive_plant_code is not None
            else None
        ),
    )


def add_persons(
    new: Activity,
    old: LegacyActivity,
):
    for person in old.activity_payload.form_data.activity_type_data.activity_persons:
        Participant.objects.create(
            activity=new,
            name=person.person_name,
            pac_number=str(person.applicator_license),
        )


def add_terrestrial_plant_observation_information(new: Activity, old: LegacyActivity):
    old_information = (
        old.activity_payload.form_data.activity_subtype_data.Observation_PlantTerrestrial_Information
    )

    TerrestrialPlantObservationInfo.objects.create(
        activity=new,
        research_observation=old_information.research_detection_ind,
        aspect=(
            AspectCode.objects.get(code=old_information.aspect_code)
            if old_information.aspect_code is not None
            else None
        ),
        slope_percent=(
            SlopePercentCode.objects.get(code=old_information.slope_code)
            if old_information.slope_code is not None
            else None
        ),
        specific_use=(
            SpecificUseCode.objects.get(code=old_information.specific_use_code)
            if old_information.specific_use_code is not None
            else None
        ),
        soil_texture=(
            SoilTextureCode.objects.get(code=old_information.soil_texture_code)
            if old_information.soil_texture_code is not None
            else None
        ),
        suitable_for_biocontrol_agent=old_information.suitable_for_biocontrol_agent,
        visible_well_nearby=old_information.well_ind,
    )


def add_subtype_payload_for_plant_terrestrial_observation(
    new: Activity, old: LegacyActivity
):

    add_persons(new, old)
    add_well_information(new, old)
    add_terrestrial_plant_observation_information(new, old)

    if old.activity_payload.form_data.activity_type_data.pre_treatment_observation:
        PretreatmentObservation.objects.create(
            activity=new,
            pre_treatment_observation=old.activity_payload.form_data.activity_type_data.pre_treatment_observation,
        )

    for plant in old.activity_payload.form_data.activity_subtype_data.TerrestrialPlants:
        TerrestrialPlantObservationDetail.objects.create(
            activity=new,
            observation_type=(
                ObservationType.Positive.value
                if plant.observation_type == "Positive Observation"
                else ObservationType.Negative.value
            ),
            life_stage=(
                PlantLifeStageCode.objects.get(code=plant.plant_life_stage_code)
                if plant.plant_life_stage_code is not None
                else None
            ),
            density=(
                DensityCode.objects.get(code=plant.invasive_plant_density_code)
                if plant.invasive_plant_density_code is not None
                else None
            ),
            distribution=(
                DistributionCode.objects.get(
                    code=plant.invasive_plant_distribution_code
                )
                if plant.invasive_plant_distribution_code is not None
                else None
            ),
            invasive_plant=(
                TerrestrialPlantCode.objects.get(code=plant.invasive_plant_code)
                if plant.invasive_plant_code is not None
                else None
            ),
        )

        if plant.voucher_specimen_collection_information is not None:
            add_voucher_specimen(new, old, plant)
