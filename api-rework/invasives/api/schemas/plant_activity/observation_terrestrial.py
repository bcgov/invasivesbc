from typing import Dict, Any
from api.models.activity.activity import Activity, DraftActivity
from api.models.activity import (
    ActivityDataRecord,
    SpecificUse,
    PretreatmentObservation,
    TerrestrialVoucherSpecimen,
    TerrestrialPlantObservationContext,
    TerrestrialPlantObservationEntries,
    DraftActivityDataRecord,
    DraftSpecificUse,
    DraftPretreatmentObservation,
    DraftTerrestrialVoucherSpecimen,
    DraftTerrestrialPlantObservationContext,
    DraftTerrestrialPlantObservationEntries,
)
from . import BaseActivityProcessor, DraftBaseActivityProcessor


class PlantObservationTerrestrialIn(BaseActivityProcessor):

    @classmethod
    def save_subtype_records(cls, subtype_data: Dict[str, Any], parent: Activity):
        """
        Processes a pre-validated dictionary structure.
        Pydantic has already cast empty strings to None and verified all types.
        """
        adr = ActivityDataRecord.objects.create(activity=parent)

        context_data = subtype_data.get("context")
        if context_data:

            specific_uses = context_data.pop("specific_uses", [])
            if specific_uses:
                SpecificUse.objects.bulk_create(
                    SpecificUse(activity_data_record=adr, **su) for su in specific_uses
                )
            TerrestrialPlantObservationContext.objects.create(
                activity_data_record=adr, **context_data
            )

        pretreat_data = subtype_data.get("pretreatment_observation")
        if pretreat_data:
            PretreatmentObservation.objects.create(
                activity_data_record=adr, pre_treatment_observation=pretreat_data
            )

        for entry in subtype_data.get("entries", []):
            # Create ADR per entry so nested items attach properly
            adr = ActivityDataRecord.objects.create(activity=parent)
            voucher_data = entry.pop("voucher_specimen", None)
            if voucher_data:
                TerrestrialVoucherSpecimen.objects.create(
                    activity_data_record=adr,
                    invasive_plant_id=entry["invasive_plant"],
                    **voucher_data
                )
            TerrestrialPlantObservationEntries.objects.create(
                activity_data_record=adr, **entry
            )


class DraftPlantObservationTerrestrialIn(DraftBaseActivityProcessor):

    @classmethod
    def save_subtype_records(cls, subtype_data: Dict[str, Any], parent: DraftActivity):
        """
        Processes a pre-validated dictionary structure.
        Pydantic has already cast empty strings to None and verified all types.
        """
        adr = DraftActivityDataRecord.objects.create(activity=parent)

        context_data = subtype_data.get("context")
        if context_data:

            specific_uses = context_data.pop("specific_uses", [])
            if specific_uses:
                DraftSpecificUse.objects.bulk_create(
                    DraftSpecificUse(activity_data_record=adr, **su)
                    for su in specific_uses
                )
            DraftTerrestrialPlantObservationContext.objects.create(
                activity_data_record=adr, **context_data
            )

        pretreat_data = subtype_data.get("pretreatment_observation")
        if pretreat_data:
            DraftPretreatmentObservation.objects.create(
                activity_data_record=adr, pre_treatment_observation=pretreat_data
            )

        for entry in subtype_data.get("entries", []):
            # Create ADR per entry so nested items attach properly
            adr = DraftActivityDataRecord.objects.create(activity=parent)
            voucher_data = entry.pop("voucher_specimen", None)
            if voucher_data:
                DraftTerrestrialVoucherSpecimen.objects.create(
                    activity_data_record=adr,
                    invasive_plant_id=entry["invasive_plant"],
                    **voucher_data
                )
            DraftTerrestrialPlantObservationEntries.objects.create(
                activity_data_record=adr, **entry
            )
