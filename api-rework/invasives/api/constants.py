from enum import Enum
import re
from api.models.activity.activity_subtypes import ActivitySubtypes
from api.models.activity import (
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolCollectionEntry,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    AquaticPlantObservationEntry,
    TerrestrialPlantObservationEntries,
    ChemPlantEntryTerrestrial,
    ChemPlantEntryAquatic,
    AquaticPlantMechanicalTreatmentEntry,
    TerrestrialPlantMechanicalTreatmentEntry,
    AquaticTreatmentMonitoringEntry,
    TerrestrialTreatmentMonitoringEntry,
    DraftTerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolCollectionEntry,
    DraftTerrestrialBiocontrolDispersalMonitoringEntry,
    DraftAquaticPlantObservationEntry,
    DraftTerrestrialPlantObservationEntries,
    DraftChemPlantEntryTerrestrial,
    DraftChemPlantEntryAquatic,
    DraftAquaticPlantMechanicalTreatmentEntry,
    DraftTerrestrialPlantMechanicalTreatmentEntry,
    DraftAquaticTreatmentMonitoringEntry,
    DraftTerrestrialTreatmentMonitoringEntry,
)

uuid_regex = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)

short_id_regex = re.compile(r"^[0-9]{2}[A-Za-z]{2,3}[0-9A-F]{8}$")


class WellKnownRoles(Enum):
    ADMINISTRATOR = "ADMINISTRATOR"
    DATA_MANAGER = "DATA_MANAGER"
    ADMINISTRATOR_PLANTS = "ADMINISTRATOR_PLANTS"
    ADMINISTRATOR_ANIMALS = "ADMINISTRATOR_ANIMALS"
    BCGOV_STAFF_ANIMALS = "BCGOV_STAFF_ANIMALS"
    BCGOV_STAFF_PLANTS = "BCGOV_STAFF_PLANTS"
    BCGOV_STAFF_BOTH = "BCGOV_STAFF_BOTH"
    CONTRACTOR_MANAGER_ANIMALS = "CONTRACTOR_MANAGER_ANIMALS"
    CONTRACTOR_MANAGER_PLANTS = "CONTRACTOR_MANAGER_PLANTS"
    CONTRACTOR_MANAGER_BOTH = "CONTRACTOR_MANAGER_BOTH"
    CONTRACTOR_STAFF_ANIMALS = "CONTRACTOR_STAFF_ANIMALS"
    CONTRACTOR_STAFF_PLANTS = "CONTRACTOR_STAFF_PLANTS"
    CONTRACTOR_STAFF_BOTH = "CONTRACTOR_STAFF_BOTH"
    INDIGENOUS_RISO_MANAGER_ANIMALS = "INDIGENOUS_RISO_MANAGER_ANIMALS"
    INDIGENOUS_RISO_MANAGER_PLANTS = "INDIGENOUS_RISO_MANAGER_PLANTS"
    INDIGENOUS_RISO_MANAGER_BOTH = "INDIGENOUS_RISO_MANAGER_BOTH"
    INDIGENOUS_RISO_STAFF_ANIMALS = "INDIGENOUS_RISO_STAFF_ANIMALS"
    INDIGENOUS_RISO_STAFF_PLANTS = "INDIGENOUS_RISO_STAFF_PLANTS"
    INDIGENOUS_RISO_STAFF_BOTH = "INDIGENOUS_RISO_STAFF_BOTH"
    MASTER_ADMINISTRATOR = "MASTER_ADMINISTRATOR"
    MUSSEL_INSPECTION_OFFICER = "MUSSEL_INSPECTION_OFFICER"
    BIOCONTROL_USER = "BIOCONTROL_USER"
    DATA_MANAGER_ANIMALS = "DATA_MANAGER_ANIMALS"
    DATA_MANAGER_PLANTS = "DATA_MANAGER_PLANTS"
    DATA_MANAGER_BOTH = "DATA_MANAGER_BOTH"


ACTIVITY_TO_PLANT = {
    ActivitySubtypes.Biocontrol_Collection.name: [TerrestrialBiocontrolCollectionEntry],
    ActivitySubtypes.Biocontrol_Release.name: [TerrestrialBiocontrolReleaseEntry],
    ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: [
        TerrestrialBiocontrolDispersalMonitoringEntry
    ],
    ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: [
        TerrestrialBiocontrolDispersalMonitoringEntry
    ],
    ActivitySubtypes.Observation_Plant_Aquatic.name: [AquaticPlantObservationEntry],
    ActivitySubtypes.Observation_Plant_Terrestrial.name: [
        TerrestrialPlantObservationEntries
    ],
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: [
        ChemPlantEntryTerrestrial
    ],
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: [ChemPlantEntryAquatic],
    ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: [
        AquaticPlantMechanicalTreatmentEntry
    ],
    ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: [
        TerrestrialPlantMechanicalTreatmentEntry
    ],
    ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: [
        AquaticTreatmentMonitoringEntry,
        TerrestrialTreatmentMonitoringEntry,
    ],
    ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: [
        AquaticTreatmentMonitoringEntry,
        TerrestrialTreatmentMonitoringEntry,
    ],
}

DRAFT_ACTIVITY_TO_PLANT = {
    ActivitySubtypes.Biocontrol_Collection.name: [
        DraftTerrestrialBiocontrolCollectionEntry
    ],
    ActivitySubtypes.Biocontrol_Release.name: [DraftTerrestrialBiocontrolReleaseEntry],
    ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: [
        DraftTerrestrialBiocontrolDispersalMonitoringEntry
    ],
    ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: [
        DraftTerrestrialBiocontrolDispersalMonitoringEntry
    ],
    ActivitySubtypes.Observation_Plant_Aquatic.name: [
        DraftAquaticPlantObservationEntry
    ],
    ActivitySubtypes.Observation_Plant_Terrestrial.name: [
        DraftTerrestrialPlantObservationEntries
    ],
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: [
        DraftChemPlantEntryTerrestrial
    ],
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: [
        DraftChemPlantEntryAquatic
    ],
    ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: [
        DraftAquaticPlantMechanicalTreatmentEntry
    ],
    ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: [
        DraftTerrestrialPlantMechanicalTreatmentEntry
    ],
    ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: [
        DraftAquaticTreatmentMonitoringEntry,
        DraftTerrestrialTreatmentMonitoringEntry,
    ],
    ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: [
        DraftAquaticTreatmentMonitoringEntry,
        DraftTerrestrialTreatmentMonitoringEntry,
    ],
}
