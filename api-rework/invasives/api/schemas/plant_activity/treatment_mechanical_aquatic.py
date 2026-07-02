from . import BaseActivityProcessor, DraftBaseActivityProcessor
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    ShorelineTypes,
    AquaticPlantMechanicalTreatmentEntry,
    AquaticMechanicalAuthorization,
    DraftActivity,
    DraftActivityDataRecord,
    DraftShorelineTypes,
    DraftAquaticPlantMechanicalTreatmentEntry,
    DraftAquaticMechanicalAuthorization,
)


class PlantTreatmentMechanicalAquaticIn(BaseActivityProcessor):

    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)

        ShorelineTypes.objects.bulk_create(
            ShorelineTypes(activity_data_record=adr, **shoreline_type)
            for shoreline_type in subtype_data.get("shoreline_types", [])
        )
        AquaticPlantMechanicalTreatmentEntry.objects.bulk_create(
            AquaticPlantMechanicalTreatmentEntry(activity_data_record=adr, **entry)
            for entry in subtype_data.get("entries", [])
        )
        auth_info = subtype_data.get("authorization_information")
        if auth_info:
            AquaticMechanicalAuthorization.objects.create(
                activity_data_record=adr, authorization_information=auth_info
            )


class DraftPlantTreatmentMechanicalAquaticIn(DraftBaseActivityProcessor):

    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: DraftActivity):
        adr = DraftActivityDataRecord.objects.create(activity=parent)

        DraftShorelineTypes.objects.bulk_create(
            DraftShorelineTypes(activity_data_record=adr, **shoreline_type)
            for shoreline_type in subtype_data.get("shoreline_types", [])
        )
        DraftAquaticPlantMechanicalTreatmentEntry.objects.bulk_create(
            DraftAquaticPlantMechanicalTreatmentEntry(activity_data_record=adr, **entry)
            for entry in subtype_data.get("entries", [])
        )
        auth_info = subtype_data.get("authorization_information")
        if auth_info:
            DraftAquaticMechanicalAuthorization.objects.create(
                activity_data_record=adr, authorization_information=auth_info
            )
