from typing import Union, Annotated
from pydantic import Field
from api.protocol.activity.plant_subtypes import (
    # Observations
    ## Submissions
    ObservationTerrestrialSchema,
    ObservationAquaticSchema,
    ## Drafts
    DraftObservationTerrestrialSchema,
    DraftObservationAquaticSchema,
    # Biocontrol
    ## Submissions
    TreatmentBiocontrolRelease,
    BiocontrolCollection,
    BiocontrolDispersalMonitoring,
    ## Drafts
    DraftTreatmentBiocontrolRelease,
    DraftBiocontrolCollection,
    DraftBiocontrolDispersalMonitoring,
    #  Treatments
    ## Submissions
    TreatmentChemicalTerrestrial,
    TreatmentMechanicalAquatic,
    TreatmentChemicalAquatic,
    TreatmentMechanicalTerrestrial,
    ## Drafts
    DraftTreatmentChemicalAquatic,
    DraftTreatmentMechanicalTerrestrial,
    DraftTreatmentChemicalTerrestrial,
    DraftTreatmentMechanicalAquatic,
    # Monitoring
    ## Submissions
    MonitoringMechanical,
    MonitoringChemical,
    MonitoringBiocontrolRelease,
    ## Drafts
    DraftMonitoringChemical,
    DraftMonitoringMechanical,
    DraftMonitoringBiocontrolRelease,
)

#: Protocol for incoming record "submissions".
#: Covers all 12 Plant Subtypes with Strict Validation.
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

#: Protocol for incoming records flagged as drafts.
#: Covers all 12 Plant Subtypes with Loose Validation.
#: Provides cleaning on incoming data (key pruning, code validations)
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
