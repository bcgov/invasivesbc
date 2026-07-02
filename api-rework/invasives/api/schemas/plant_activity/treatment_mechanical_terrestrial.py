from . import BaseActivityProcessor, DraftBaseActivityProcessor
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    TerrestrialPlantMechanicalTreatmentEntry,
    DraftActivity,
    DraftActivityDataRecord,
    DraftTerrestrialPlantMechanicalTreatmentEntry,
)


class PlantTreatmentMechanicalTerrestrialIn(BaseActivityProcessor):
    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        TerrestrialPlantMechanicalTreatmentEntry.objects.bulk_create(
            TerrestrialPlantMechanicalTreatmentEntry(activity_data_record=adr, **entry)
            for entry in subtype_data.get("entries", [])
        )


class DraftPlantTreatmentMechanicalTerrestrialIn(DraftBaseActivityProcessor):
    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: DraftActivity):
        adr = DraftActivityDataRecord.objects.create(activity=parent)
        DraftTerrestrialPlantMechanicalTreatmentEntry.objects.bulk_create(
            DraftTerrestrialPlantMechanicalTreatmentEntry(
                activity_data_record=adr, **entry
            )
            for entry in subtype_data.get("entries", [])
        )
