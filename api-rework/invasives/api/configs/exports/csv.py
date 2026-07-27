from api.models.activity import ActivitySubtypes

from api.models.activity import (
    TerrestrialPlantObservationEntries,
    AquaticPlantObservationEntry,
    AquaticTreatmentMonitoringEntry,
    TerrestrialTreatmentMonitoringEntry,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolCollectionEntry,
    TerrestrialPlantMechanicalTreatmentEntry,
    AquaticPlantMechanicalTreatmentEntry,
    ChemPlantEntryAquatic,
    ChemPlantEntryTerrestrial,
)
from . import (
    OBSERVATION_AQUATIC_ANNOTATIONS,
    OBSERVATION_TERRESTRIAL_ANNOTATIONS,
    MONITORING_ANNOTATIONS,
    MONITORING_BIOCONTROL_DISPERSAL_RELEASE_ANNOTATIONS,
    BIOCONTROL_RELEASE_ANNOTATIONS,
    AGENT_COUNT_ANNOTATIONS,
    EXTENDED_AGENT_COUNT_ANNOTATIONS,
    PLANT_PHENOLOGY_ANNOTATIONS,
    BIOCONTROL_WEATHER_ANNOTATIONS,
    SPREAD_RESULTS_ANNOTATIONS,
    BIOCONTROL_COLLECTION_ANNOTATIONS,
    TREATMENT_MECHANICAL_TERRESTRIAL_ANNOTATIONS,
    TREATMENT_MECHANICAL_AQUATIC_ANNOTATIONS,
    TREATMENT_CHEMICAL_ANNOTATIONS,
)

CSV_SUBTYPE_CONFIG = {
    ActivitySubtypes.Observation_Plant_Terrestrial.name: {
        "entry_models": [TerrestrialPlantObservationEntries],
        "annotations": OBSERVATION_TERRESTRIAL_ANNOTATIONS,
    },
    ActivitySubtypes.Observation_Plant_Aquatic.name: {
        "entry_models": [AquaticPlantObservationEntry],
        "annotations": OBSERVATION_AQUATIC_ANNOTATIONS,
    },
    ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: {
        "entry_models": [
            AquaticTreatmentMonitoringEntry,
            TerrestrialTreatmentMonitoringEntry,
        ],
        "annotations": MONITORING_ANNOTATIONS,
    },
    ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: {
        "entry_models": [
            AquaticTreatmentMonitoringEntry,
            TerrestrialTreatmentMonitoringEntry,
        ],
        "annotations": MONITORING_ANNOTATIONS,
    },
    ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: {
        "entry_models": [TerrestrialBiocontrolDispersalMonitoringEntry],
        "annotations": BIOCONTROL_WEATHER_ANNOTATIONS
        + MONITORING_BIOCONTROL_DISPERSAL_RELEASE_ANNOTATIONS
        + EXTENDED_AGENT_COUNT_ANNOTATIONS
        + PLANT_PHENOLOGY_ANNOTATIONS,
    },
    ActivitySubtypes.Biocontrol_Release.name: {
        "entry_models": [TerrestrialBiocontrolReleaseEntry],
        "annotations": BIOCONTROL_WEATHER_ANNOTATIONS
        + BIOCONTROL_RELEASE_ANNOTATIONS
        + AGENT_COUNT_ANNOTATIONS
        + PLANT_PHENOLOGY_ANNOTATIONS,
    },
    ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: {
        "entry_models": [TerrestrialBiocontrolDispersalMonitoringEntry],
        "annotations": BIOCONTROL_WEATHER_ANNOTATIONS
        + MONITORING_BIOCONTROL_DISPERSAL_RELEASE_ANNOTATIONS
        + EXTENDED_AGENT_COUNT_ANNOTATIONS
        + PLANT_PHENOLOGY_ANNOTATIONS
        + SPREAD_RESULTS_ANNOTATIONS,
    },
    ActivitySubtypes.Biocontrol_Collection.name: {
        "entry_models": [TerrestrialBiocontrolCollectionEntry],
        "annotations": BIOCONTROL_WEATHER_ANNOTATIONS
        + BIOCONTROL_COLLECTION_ANNOTATIONS
        + AGENT_COUNT_ANNOTATIONS
        + PLANT_PHENOLOGY_ANNOTATIONS,
    },
    ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: {
        "entry_models": [TerrestrialPlantMechanicalTreatmentEntry],
        "annotations": TREATMENT_MECHANICAL_TERRESTRIAL_ANNOTATIONS,
    },
    ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: {
        "entry_models": [AquaticPlantMechanicalTreatmentEntry],
        "annotations": TREATMENT_MECHANICAL_AQUATIC_ANNOTATIONS,
    },
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: {
        "entry_models": [ChemPlantEntryAquatic],
        "annotations": TREATMENT_CHEMICAL_ANNOTATIONS,
    },
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: {
        "entry_models": [ChemPlantEntryTerrestrial],
        "annotations": TREATMENT_CHEMICAL_ANNOTATIONS,
    },
}
