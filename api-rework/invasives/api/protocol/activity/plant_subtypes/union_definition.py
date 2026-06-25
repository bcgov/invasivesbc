from typing import Union, Annotated
from pydantic import Field
from api.protocol.activity.plant_subtypes import (
    # Observations
    ObservationTerrestrialSchema,
    DraftObservationTerrestrialSchema,
    ObservationAquaticSchema,
    DraftObservationAquaticSchema,
    # Biocontrol
    TreatmentBiocontrolRelease,
    DraftTreatmentBiocontrolRelease,
    BiocontrolCollection,
    DraftBiocontrolCollection,
    BiocontrolDispersalMonitoring,
    DraftBiocontrolDispersalMonitoring,
    #  Treatments
    TreatmentChemicalTerrestrial,
    DraftTreatmentChemicalTerrestrial,
    TreatmentChemicalAquatic,
    DraftTreatmentChemicalAquatic,
    TreatmentMechanicalTerrestrial,
    DraftTreatmentMechanicalTerrestrial,
    TreatmentMechanicalAquatic,
    DraftTreatmentMechanicalAquatic,
    # Monitoring
    MonitoringMechanical,
    DraftMonitoringMechanical,
    MonitoringChemical,
    DraftMonitoringChemical,
    MonitoringBiocontrolRelease,
    DraftMonitoringBiocontrolRelease,
)

PlantActivitySchema = Annotated[
    Union[
        # Observations
        ObservationTerrestrialSchema,
        ObservationAquaticSchema,
        # Biocontrol
        TreatmentBiocontrolRelease,
        BiocontrolCollection,
        # Treatments
        TreatmentChemicalTerrestrial,
        TreatmentChemicalAquatic,
        TreatmentMechanicalTerrestrial,
        TreatmentMechanicalAquatic,
        # Monitoring
        MonitoringMechanical,
        MonitoringChemical,
        MonitoringBiocontrolRelease,
        BiocontrolDispersalMonitoring,
    ],
    Field(discriminator="subtype"),
]

DraftPlantActivitySchema = Annotated[
    Union[
        # Observation
        DraftObservationTerrestrialSchema,
        DraftObservationAquaticSchema,
        # Biocontrol
        DraftTreatmentBiocontrolRelease,
        DraftBiocontrolCollection,
        # Treatments
        DraftTreatmentChemicalTerrestrial,
        DraftTreatmentChemicalAquatic,
        DraftTreatmentMechanicalTerrestrial,
        DraftTreatmentMechanicalAquatic,
        # Monitoring
        DraftMonitoringMechanical,
        DraftMonitoringChemical,
        DraftMonitoringBiocontrolRelease,
        DraftBiocontrolDispersalMonitoring,
    ],
    Field(discriminator="subtype"),
]
