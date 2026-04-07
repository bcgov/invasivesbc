import logging
from pprint import pformat

from api.legacy_db.mappings.participants import add_persons
from api.legacy_db.mappings.waterbody import add_shoreline_types, add_waterbody_data
from api.legacy_db.mappings.wells import add_well_information
from api.legacy_db.model_serializer import (
    LegacyActivity,
    LegacyActivityTerrestrialPlants,
)
from api.models.activity import (
    Activity,
    PretreatmentObservation,
    TerrestrialPlantObservationEntries,
    TerrestrialPlantObservationContext,
    TerrestrialVoucherSpecimen,
    SpecificUse,
    AquaticPlantObservationEntry,
    AquaticPlantObservationContext,
    TargetPlantPhenology,
    TargetPlantHeights,
    ActivityDataRecord,
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
    AquaticPlantCode,
)
from api.models.enums import ObservationType


def add_target_plant_phenology(new: Activity, old: LegacyActivity):
    phenology = (
        old.activity_payload.form_data.activity_subtype_data.Target_Plant_Phenology
    )

    if phenology is None:
        return

    if (
        phenology.phenology_details_recorded is not None
        and phenology.phenology_details_recorded == "No"
    ):
        # there is nothing to record
        return

    adr = ActivityDataRecord.objects.create(activity=new)
    TargetPlantPhenology.objects.create(
        activity_data_record=adr,
        winter_dormant=phenology.winter_dormant,
        seedlings=phenology.seedlings,
        rosettes=phenology.rosettes,
        bolts=phenology.bolts,
        flowering=phenology.flowering,
        seeds_forming=phenology.seeds_forming,
        senescent=phenology.senescent,
    )

    if phenology.target_plant_heights is not None:
        for height in phenology.target_plant_heights:
            adr = ActivityDataRecord.objects.create(activity=new)
            TargetPlantHeights.objects.create(
                activity_data_record=adr, height_cm=height
            )


def add_voucher_specimen(
    new: Activity,
    adr: ActivityDataRecord,
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
            activity_data_record=adr,
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


def add_terrestrial_plant_observation_information(new: Activity, old: LegacyActivity):
    old_information = (
        old.activity_payload.form_data.activity_subtype_data.Observation_PlantTerrestrial_Information
    )

    adr = ActivityDataRecord.objects.create(activity=new)
    TerrestrialPlantObservationContext.objects.create(
        activity_data_record=adr,
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

        SpecificUse.objects.update_or_create(
            activity_data_record=adr, specific_use=found_code
        )


def add_subtype_payload_for_plant_terrestrial_observation(
    new: Activity, old: LegacyActivity
):

    add_persons(new, old)
    add_well_information(new, old)
    add_terrestrial_plant_observation_information(new, old)
    adr = ActivityDataRecord.objects.create(activity=new)

    if old.activity_payload.form_data.activity_type_data.pre_treatment_observation:
        PretreatmentObservation.objects.create(
            activity_data_record=adr,
            pre_treatment_observation=old.activity_payload.form_data.activity_type_data.pre_treatment_observation,
        )

    for plant in old.activity_payload.form_data.activity_subtype_data.TerrestrialPlants:
        TerrestrialPlantObservationEntries.objects.create(
            activity_data_record=adr,
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
            add_voucher_specimen(new, adr, plant)


def add_aquatic_plant_observation_information(new: Activity, old: LegacyActivity):
    old_information = (
        old.activity_payload.form_data.activity_subtype_data.Observation_PlantAquatic_Information
    )

    adr = ActivityDataRecord.objects.create(activity=new)
    AquaticPlantObservationContext.objects.create(
        activity_data_record=adr,
        suitable_for_biocontrol=old_information.suitable_for_biocontrol_agent,
    )


def add_subtype_payload_for_plant_aquatic_observation(
    new: Activity, old: LegacyActivity
):

    add_persons(new, old)
    add_well_information(new, old)
    add_aquatic_plant_observation_information(new, old)
    add_shoreline_types(new, old)
    add_waterbody_data(new, old)

    if old.activity_payload.form_data.activity_type_data.pre_treatment_observation:
        adr = ActivityDataRecord.objects.create(activity=new)
        PretreatmentObservation.objects.create(
            activity_data_record=adr,
            pre_treatment_observation=old.activity_payload.form_data.activity_type_data.pre_treatment_observation,
        )

    for plant in old.activity_payload.form_data.activity_subtype_data.AquaticPlants:
        adr = ActivityDataRecord.objects.create(activity=new)
        AquaticPlantObservationEntry.objects.create(
            activity_data_record=adr,
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
                AquaticPlantCode.objects.get(code=plant.invasive_plant_code)
                if plant.invasive_plant_code is not None
                else None
            ),
        )

        if plant.voucher_specimen_collection_information is not None:
            add_voucher_specimen(new, adr, plant)
