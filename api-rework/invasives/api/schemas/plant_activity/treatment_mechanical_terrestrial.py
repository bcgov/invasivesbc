from . import BaseActivityProcessor
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    TerrestrialPlantMechanicalTreatmentEntry,
)


class PlantTreatmentMechanicalTerrestrialIn(BaseActivityProcessor):
    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        TerrestrialPlantMechanicalTreatmentEntry.objects.bulk_create(
            TerrestrialPlantMechanicalTreatmentEntry(activity_data_record=adr, **entry)
            for entry in subtype_data.get("entries", [])
        )
