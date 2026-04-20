from typing import Union, Annotated
from pydantic import Field
from api.protocol.activity.plant_subtypes import (
    ObservationTerrestrialSchema,
    ObservationAquaticSchema,
    TreatmentBiocontrolRelease,
    TreatmentMechanicalTerrestrial,
    TreatmentMechanicalAquatic,
    BiocontrolCollection,
    MonitoringMechanical,
    MonitoringChemical,
    MonitoringBiocontrolRelease,
)

PlantActivitySchema = Annotated[
    Union[
        ObservationTerrestrialSchema,
        ObservationAquaticSchema,
        TreatmentBiocontrolRelease,
        BiocontrolCollection,
        TreatmentMechanicalTerrestrial,
        TreatmentMechanicalAquatic,
        MonitoringMechanical,
        MonitoringChemical,
        MonitoringBiocontrolRelease,
    ],
    Field(discriminator="subtype"),
]
