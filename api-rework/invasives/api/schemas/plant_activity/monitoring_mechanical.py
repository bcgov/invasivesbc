from . import BaseActivityProcessor, DraftBaseActivityProcessor
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    TerrestrialTreatmentMonitoringEntry,
    InvasivePlantsOnSite,
    AquaticTreatmentMonitoringEntry,
    DraftActivity,
    DraftActivityDataRecord,
    DraftTerrestrialTreatmentMonitoringEntry,
    DraftInvasivePlantsOnSite,
    DraftAquaticTreatmentMonitoringEntry,
)


class PlantMonitoringMechanicalIn(BaseActivityProcessor):

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


class DraftPlantMonitoringMechanicalIn(DraftBaseActivityProcessor):

    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: DraftActivity):
        entries = subtype_data.get("entries", [])

        adr = DraftActivityDataRecord.objects.create(activity=parent)

        for entry in entries:
            plants_on_site = entry.pop("invasive_plants_on_site", [])
            adr = DraftActivityDataRecord.objects.create(activity=parent)

            if entry["invasive_plant_aquatic"]:
                entry["invasive_plant"] = entry.pop("invasive_plant_aquatic")
                DraftAquaticTreatmentMonitoringEntry.objects.create(
                    activity_data_record=adr,
                    **entry,
                )
            else:
                # Since this is a draft record and 'invasive_plant' may not even exist, just default to Terrestrial
                # Because we at least know it's not aquatic.
                entry.pop("invasive_plant_aquatic")
                DraftTerrestrialTreatmentMonitoringEntry.objects.create(
                    activity_data_record=adr, **entry
                )

            DraftInvasivePlantsOnSite.objects.bulk_create(
                DraftInvasivePlantsOnSite(activity_data_record=adr, **plant)
                for plant in plants_on_site
            )
