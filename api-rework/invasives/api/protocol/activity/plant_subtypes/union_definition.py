from typing import Union, Annotated
from pydantic import Field
from api.protocol.activity.plant_subtypes import (
    ObservationTerrestrialSchema,
    ObservationAquaticSchema,
    TreatmentBiocontrolRelease,
    TreatmentChemicalTerrestrial,
    TreatmentChemicalAquatic,
    TreatmentMechanicalTerrestrial,
    TreatmentMechanicalAquatic,
    BiocontrolCollection,
    BiocontrolDispersalMonitoring,
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
        TreatmentChemicalTerrestrial,
        TreatmentChemicalAquatic,
        TreatmentMechanicalTerrestrial,
        TreatmentMechanicalAquatic,
        MonitoringMechanical,
        MonitoringChemical,
        MonitoringBiocontrolRelease,
        BiocontrolDispersalMonitoring,
    ],
    Field(discriminator="subtype"),
]
