from typing import Union, Annotated
from pydantic import Field
from api.protocol.activity.plant_subtypes import (
    ObservationTerrestrialSchema,
    DraftObservationTerrestrialSchema,
    ObservationAquaticSchema,
    DraftObservationAquaticSchema,
    TreatmentBiocontrolRelease,
    TreatmentChemicalTerrestrial,
    TreatmentChemicalAquatic,
    TreatmentMechanicalTerrestrial,
    DraftTreatmentMechanicalTerrestrial,
    TreatmentMechanicalAquatic,
    DraftTreatmentMechanicalAquatic,
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

DraftPlantActivitySchema = Annotated[
    Union[
        DraftObservationTerrestrialSchema,
        DraftObservationAquaticSchema,
        DraftTreatmentMechanicalAquatic,
        DraftTreatmentMechanicalTerrestrial,
    ],
    Field(discriminator="subtype"),
]
