from typing import Literal
from api.protocol.activity.plant_subtypes import MonitoringMechanical


class MonitoringChemical(MonitoringMechanical):
    subtype: Literal["Monitoring_Chemical_Plant_Terrestrial_Aquatic"]
