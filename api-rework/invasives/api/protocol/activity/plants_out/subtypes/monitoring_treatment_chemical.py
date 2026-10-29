from . import BaseRecordOut, DraftBaseRecordOut
from typing import List, Literal
from itertools import chain
from .common import MonitoringTreatmentEntryOut, DraftMonitoringTreatmentEntryOut
from django.db.models import F, CharField, Value
from api.models.activity import (
    Activity,
    DraftActivity,
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
    DraftTerrestrialTreatmentMonitoringEntry,
    DraftAquaticTreatmentMonitoringEntry,
)
from ninja import Schema


##########
# Regular
####
class SubtypeData(Schema):
    entries: List[MonitoringTreatmentEntryOut]

    @staticmethod
    def resolve_entries(obj: Activity) -> List[MonitoringTreatmentEntryOut]:
        aq = AquaticTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related(
            "invasive_plant", "management_efficacy_rating", "treatment_efficacy_rating"
        )

        t = TerrestrialTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related(
            "invasive_plant", "management_efficacy_rating", "treatment_efficacy_rating"
        )
        return list(chain(aq, t))


##########
# Draft
####
class DraftSubtypeData(SubtypeData):
    entries: List[DraftMonitoringTreatmentEntryOut]

    @staticmethod
    def resolve_entries(obj: DraftActivity) -> List[DraftMonitoringTreatmentEntryOut]:
        aq = DraftAquaticTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant")

        t = DraftTerrestrialTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant")
        return list(chain(aq, t))


##########
# Subtypes
####


class MonitoringTreatmentChemicalOut(BaseRecordOut):
    subtype: Literal["Monitoring_Chemical_Plant_Terrestrial_Aquatic"]
    subtype_data: SubtypeData


class DraftMonitoringTreatmentChemicalOut(DraftBaseRecordOut):
    subtype: Literal["Monitoring_Chemical_Plant_Terrestrial_Aquatic"]
    subtype_data: DraftSubtypeData
