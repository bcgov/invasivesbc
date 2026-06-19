from . import BaseActivityProcessor
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    ShorelineTypes,
    AquaticPlantMechanicalTreatmentEntry,
    AquaticMechanicalAuthorization,
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
