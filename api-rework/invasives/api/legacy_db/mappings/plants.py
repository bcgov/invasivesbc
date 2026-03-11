import logging
from pprint import pformat

from api.legacy_db.mappings.wells import add_well_information
from api.legacy_db.model_serializer import (
    LegacyActivity,
    LegacyActivityTerrestrialPlants,
)
from api.models.activity import (
    Activity,
    Participant,
    PretreatmentObservation,
    TerrestrialPlantObservationEntries,
    TerrestrialPlantObservationContext,
    TerrestrialVoucherSpecimen,
    SpecificUse,
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
from api.protocol.activity.api import activity_search


def add_voucher_specimen(
    new: Activity,
    old: LegacyActivity,
    plant: LegacyActivityTerrestrialPlants,
):

    if (
        plant.voucher_specimen_collected is not None
        and plant.voucher_specimen_collected == "No"
    ):
        # skip, but don't log it
        pass
    elif (
        plant.voucher_specimen_collection_information.date_voucher_verified is None
        or plant.voucher_specimen_collection_information.date_voucher_collected is None
        or plant.voucher_specimen_collection_information.name_of_herbarium is None
        or plant.voucher_specimen_collection_information.voucher_sample_id is None
    ):
        # something is unusual about this record
        logging.warning(
            "This doesn't look like a valid voucher specimen record - skipping"
        )
        logging.warning(
            f"Voucher Specimen Collected is: {plant.voucher_specimen_collected}"
        )
        logging.warning(
            "voucher spec" + pformat(plant.voucher_specimen_collection_information)
        )
        if new.migration_remarks is None:
            new.migration_remarks = ""
        new.migration_remarks += f"Source activity seems to indicate a voucher was collected, but there is not enough data to create a valid voucher specification record for this activity.\n\n"

    else:
        logging.warning(pformat(plant.voucher_specimen_collection_information))
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
                plant.voucher_specimen_collection_information.voucher_verification_completed_by.person_name
                if plant.voucher_specimen_collection_information.voucher_verification_completed_by
                is not None
                and plant.voucher_specimen_collection_information.voucher_verification_completed_by.person_name
                is not None
                and plant.voucher_specimen_collection_information.voucher_verification_completed_by.person_name.strip()
                != ""
                else None
            ),
            utm_zone=(
                plant.voucher_specimen_collection_information.exact_utm_coords.utm_zone
                if plant.voucher_specimen_collection_information.exact_utm_coords
                is not None
                else None
            ),
            utm_easting=(
                plant.voucher_specimen_collection_information.exact_utm_coords.utm_easting
                if plant.voucher_specimen_collection_information.exact_utm_coords
                is not None
                else None
            ),
            utm_northing=(
                plant.voucher_specimen_collection_information.exact_utm_coords.utm_northing
                if plant.voucher_specimen_collection_information.exact_utm_coords
                is not None
                else None
            ),
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

    TerrestrialPlantObservationContext.objects.create(
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
        soil_texture=(
            SoilTextureCode.objects.get(code=old_information.soil_texture_code.strip())
            if old_information.soil_texture_code is not None
            and old_information.soil_texture_code.strip() != ""
            else None
        ),
        suitable_for_biocontrol_agent=old_information.suitable_for_biocontrol_agent,
        visible_well_nearby=old_information.well_ind,
    )

    for code in old_information.specific_use_code.split(","):
        found_code = SpecificUseCode.objects.filter(code=code).first()
        if not found_code:
            logging.warning(f"No matching specific use code found for {code}")
            raise ValueError(f"No matching specific use code found for {code}")

        SpecificUse.objects.update_or_create(activity=new, specific_use=found_code)


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
        TerrestrialPlantObservationEntries.objects.create(
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
