from typing import Union, Annotated
from pydantic import Field
from api.protocol.activity.plant_subtypes import (
    ObservationTerrestrialSchema,
    ObservationAquaticSchema,
    TreatmentMechanicalTerrestrial,
    TreatmentMechanicalAquatic,
    MonitoringMechanical
)

PlantActivitySchema = Annotated[
    Union[
        ObservationTerrestrialSchema,
        ObservationAquaticSchema,
        TreatmentMechanicalTerrestrial,
        TreatmentMechanicalAquatic,
        MonitoringMechanical
    ],
    Field(discriminator="subtype"),
]
