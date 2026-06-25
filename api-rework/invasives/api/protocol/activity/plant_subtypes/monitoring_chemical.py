from typing import Literal
from api.protocol.activity.plant_subtypes import (
    MonitoringMechanical,
    DraftMonitoringMechanical,
)


class DraftMonitoringChemical(DraftMonitoringMechanical):
    subtype: Literal["Monitoring_Chemical_Plant_Terrestrial_Aquatic"]


class MonitoringChemical(MonitoringMechanical):
    subtype: Literal["Monitoring_Chemical_Plant_Terrestrial_Aquatic"]
