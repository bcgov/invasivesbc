from typing import Optional, List
from api.models.activity import (
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
    DraftTerrestrialTreatmentMonitoringEntry,
    DraftAquaticTreatmentMonitoringEntry,
    InvasivePlantsOnSite,
    DraftInvasivePlantsOnSite,
)
from ninja import Schema

AquaticEntry = (
    AquaticTreatmentMonitoringEntry,
    DraftAquaticTreatmentMonitoringEntry,
)
TerrestrialEntry = (
    TerrestrialTreatmentMonitoringEntry,
    DraftTerrestrialTreatmentMonitoringEntry,
)
type Entry = AquaticTreatmentMonitoringEntry | DraftAquaticTreatmentMonitoringEntry | TerrestrialTreatmentMonitoringEntry | DraftTerrestrialTreatmentMonitoringEntry


class PlantOnSite(Schema):
    invasive_plants_on_site: Optional[str]

    @staticmethod
    def resolve_invasive_plants_on_site(obj):
        return obj.invasive_plants_on_site.code if obj.invasive_plants_on_site else None


class MonitoringTreatmentEntryOut(Schema):
    invasive_plant: Optional[str] = None
    invasive_plant_aquatic: Optional[str] = None
    evidence_of_treatment: Optional[str]
    treatment_pass: Optional[str]
    comment: Optional[str]
    invasive_plants_on_site: List[PlantOnSite]
    management_efficacy_rating: Optional[str]
    treatment_efficacy_rating: Optional[str]

    @staticmethod
    def resolve_invasive_plant(obj: Entry):
        if isinstance(obj, TerrestrialEntry):
            return obj.invasive_plant.code if obj.invasive_plant else None
        return None

    @staticmethod
    def resolve_invasive_plant_aquatic(obj: Entry):
        if isinstance(obj, AquaticEntry):
            return obj.invasive_plant.code if obj.invasive_plant else None
        return None

    @staticmethod
    def resolve_invasive_plants_on_site(obj: Entry):
        return InvasivePlantsOnSite.objects.filter(
            activity_data_record=obj.activity_data_record
        ).select_related("invasive_plants_on_site")

    @staticmethod
    def resolve_management_efficacy_rating(obj: Entry):
        return (
            obj.management_efficacy_rating.code
            if obj.management_efficacy_rating
            else None
        )

    @staticmethod
    def resolve_treatment_efficacy_rating(obj: Entry):
        return (
            obj.treatment_efficacy_rating.code
            if obj.treatment_efficacy_rating
            else None
        )


class DraftMonitoringTreatmentEntryOut(MonitoringTreatmentEntryOut):
    @staticmethod
    def resolve_invasive_plants_on_site(obj: Entry) -> List[PlantOnSite]:
        return DraftInvasivePlantsOnSite.objects.filter(
            activity_data_record__id=obj.activity_data_record.id
        ).select_related("invasive_plants_on_site")
