from api.models.activity import ActivitySubtypes

from api.models.activity import (
    TerrestrialPlantObservationEntries,
    AquaticPlantObservationEntry,
    AquaticTreatmentMonitoringEntry,
    TerrestrialTreatmentMonitoringEntry,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    TerrestrialBiocontrolReleaseEntry,
)
from . import (
    OBSERVATION_AQUATIC_ANNOTATIONS,
    OBSERVATION_TERRESTRIAL_ANNOTATIONS,
    MONITORING_ANNOTATIONS,
    MONITORING_BIOCONTROL_DISPERSAL_ANNOTATIONS,
    BIOCONTROL_RELEASE_ANNOTATIONS,
    AGENT_COUNT_ANNOTATIONS,
    EXTENDED_AGENT_COUNT_ANNOTATIONS,
    PLANT_PHENOLOGY_ANNOTATIONS,
    BIOCONTROL_WEATHER_ANNOTATIONS,
)

ADR_BASE = "activity_data_record__activity__activitydatarecord_set"
CSV_SUBTYPE_CONFIG = {
    ActivitySubtypes.Observation_Plant_Terrestrial.name: {
        "entry_models": [TerrestrialPlantObservationEntries],
        "annotations": OBSERVATION_TERRESTRIAL_ANNOTATIONS,
        "prefetch_related": [
            f"{ADR_BASE}__specificuse_set__specific_use",
        ],
        "select_related": [],
    },
    ActivitySubtypes.Observation_Plant_Aquatic.name: {
        "entry_models": [AquaticPlantObservationEntry],
        "annotations": OBSERVATION_AQUATIC_ANNOTATIONS,
        "prefetch_related": [
            f"{ADR_BASE}__waterbodycontext_set__type",
            f"{ADR_BASE}__waterbodyuse_set__waterbody_use",
            f"{ADR_BASE}__waterbodylevelmanagement_set__waterlevel_management",
            f"{ADR_BASE}__waterbodysubstratetype_set__substrate_type",
            f"{ADR_BASE}__waterbodyadjacentlanduse_set__waterbody_adjacent_land_use",
            f"{ADR_BASE}__aquaticplantobservationcontext_set",
            f"{ADR_BASE}__pretreatmentobservation_set",
            f"{ADR_BASE}__aquaticvoucherspecimen_set",
            f"{ADR_BASE}__shorelinetypes_set__shoreline_type",
            f"{ADR_BASE}__waterbodyinflowpermanent_set__flow_code",
            f"{ADR_BASE}__waterbodyinflowseasonal_set__flow_code",
            f"{ADR_BASE}__waterbodyoutflowpermanent_set__flow_code",
            f"{ADR_BASE}__waterbodyoutflowseasonal_set__flow_code",
        ],
        "select_related": [],
    },
    ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: {
        "entry_models": [
            AquaticTreatmentMonitoringEntry,
            TerrestrialTreatmentMonitoringEntry,
        ],
        "annotations": MONITORING_ANNOTATIONS,
        "prefetch_related": [],
    },
    ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: {
        "entry_models": [
            AquaticTreatmentMonitoringEntry,
            TerrestrialTreatmentMonitoringEntry,
        ],
        "annotations": MONITORING_ANNOTATIONS,
        "prefetch_related": [],
    },
    ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: {
        "entry_models": [TerrestrialBiocontrolDispersalMonitoringEntry],
        "annotations": BIOCONTROL_WEATHER_ANNOTATIONS
        + MONITORING_BIOCONTROL_DISPERSAL_ANNOTATIONS
        + EXTENDED_AGENT_COUNT_ANNOTATIONS
        + PLANT_PHENOLOGY_ANNOTATIONS,
        "prefetch_related": [],
    },
    ActivitySubtypes.Biocontrol_Release.name: {
        "entry_models": [TerrestrialBiocontrolReleaseEntry],
        "annotations": BIOCONTROL_WEATHER_ANNOTATIONS
        + BIOCONTROL_RELEASE_ANNOTATIONS
        + AGENT_COUNT_ANNOTATIONS
        + PLANT_PHENOLOGY_ANNOTATIONS,
        "prefetch_related": [],
    },
}
