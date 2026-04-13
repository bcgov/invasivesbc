from typing import Union, Annotated
from pydantic import Field
from api.protocol.activity.plant_subtypes import (
    ObservationTerrestrialSchema,
    ObservationAquaticSchema,
    TreatmentMechanicalTerrestrial,
    TreatmentMechanicalAquatic,
    MonitoringMechanical,
    MonitoringChemical
)

PlantActivitySchema = Annotated[
    Union[
        ObservationTerrestrialSchema,
        ObservationAquaticSchema,
        TreatmentMechanicalTerrestrial,
        TreatmentMechanicalAquatic,
        MonitoringMechanical,
        MonitoringChemical
    ],
    Field(discriminator="subtype"),
]
