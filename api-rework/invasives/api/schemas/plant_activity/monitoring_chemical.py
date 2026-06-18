from . import BaseActivityProcessor
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    TerrestrialTreatmentMonitoringEntry,
    InvasivePlantsOnSite,
    AquaticTreatmentMonitoringEntry,
)


class PlantMonitoringChemicalIn(BaseActivityProcessor):

    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        entries = subtype_data.get("entries", [])

        adr = ActivityDataRecord.objects.create(activity=parent)

        for entry in entries:
            plants_on_site = entry.pop("invasive_plants_on_site", [])
            adr = ActivityDataRecord.objects.create(activity=parent)

            if entry["invasive_plant"]:
                entry.pop("invasive_plant_aquatic")
                TerrestrialTreatmentMonitoringEntry.objects.create(
                    activity_data_record=adr, **entry
                )

            elif entry["invasive_plant_aquatic"]:
                entry["invasive_plant"] = entry.pop("invasive_plant_aquatic")
                AquaticTreatmentMonitoringEntry.objects.create(
                    activity_data_record=adr,
                    **entry,
                )

            InvasivePlantsOnSite.objects.bulk_create(
                InvasivePlantsOnSite(activity_data_record=adr, **plant)
                for plant in plants_on_site
            )
