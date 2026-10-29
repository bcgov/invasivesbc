from typing import Literal
from . import MonitoringTreatmentChemicalOut, DraftMonitoringTreatmentChemicalOut


class MonitoringTreatmentMechanicalOut(MonitoringTreatmentChemicalOut):
    subtype: Literal["Monitoring_Mechanical_Plant_Terrestrial_Aquatic"]


class DraftMonitoringTreatmentMechanicalOut(DraftMonitoringTreatmentChemicalOut):
    subtype: Literal["Monitoring_Mechanical_Plant_Terrestrial_Aquatic"]
