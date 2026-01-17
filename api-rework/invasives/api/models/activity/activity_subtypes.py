from dataclasses import dataclass
from enum import Enum, Flag, StrEnum, auto


class SubtypePrimary(StrEnum):
    Biocontrol = "Biocontrol"
    Monitoring = "Monitoring"
    Treatment = "Treatment"
    Observation = "Observation"
    Shift = "Shift"


class TreatmentMethod(StrEnum):
    Chemical = "Chemical"
    Mechanical = "Mechanical"


class Species(Flag):
    AquaticPlant = auto()
    TerrestrialPlant = auto()
    Mussels = auto()


@dataclass
class ActivitySubtype:
    typeOfActivity: SubtypePrimary | None
    treatmentMethod: TreatmentMethod | None
    species: Species | None
    short_id_format: str
    legacyDatabaseName: list[str]  # For mapping the old names to the enum values


class ActivitySubtypes(ActivitySubtype, Enum):

    Biocontrol_Collection = (
        SubtypePrimary.Biocontrol,
        None,
        None,
        "BCC",
        ["Activity_Biocontrol_Collection"],
    )

    Biocontrol_Release = (
        SubtypePrimary.Biocontrol,
        None,
        None,
        "BCR",
        ["Activity_Biocontrol_Release"],
    )
    Monitoring_Biocontrol_Dispersal_Plant_Terrestrial = (
        SubtypePrimary.Biocontrol,
        None,
        Species.TerrestrialPlant,
        "BCMD",
        ["Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant"],
    )
    Monitoring_Biocontrol_Release_Plant_Terrestrial = (
        SubtypePrimary.Biocontrol,
        None,
        Species.TerrestrialPlant,
        "BCMR",
        ["Activity_Monitoring_BiocontrolRelease_TerrestrialPlant"],
    )
    Monitoring_Chemical_Plant_Terrestrial_Aquatic = (
        SubtypePrimary.Monitoring,
        TreatmentMethod.Chemical,
        Species.TerrestrialPlant | Species.AquaticPlant,
        "MCP",
        ["Activity_Monitoring_ChemicalTerrestrialAquaticPlant"],
    )
    Monitoring_Mechanical_Plant_Terrestrial_Aquatic = (
        SubtypePrimary.Monitoring,
        TreatmentMethod.Mechanical,
        Species.TerrestrialPlant | Species.AquaticPlant,
        "MMP",
        ["Activity_Monitoring_MechanicalTerrestrialAquaticPlant"],
    )
    Observation_Mussels = (
        SubtypePrimary.Observation,
        None,
        Species.Mussels,
        "MUS",
        ["Activity_Observation_Mussels"],
    )
    Observation_Plant_Aquatic = (
        SubtypePrimary.Observation,
        None,
        Species.AquaticPlant,
        "OBSA",
        ["Activity_Observation_PlantAquatic"],
    )

    Observation_Plant_Terrestrial = (
        SubtypePrimary.Observation,
        None,
        Species.TerrestrialPlant,
        "OBST",
        ["Activity_Observation_PlantTerrestrial"],
    )

    Officer_Shift = (
        SubtypePrimary.Shift,
        None,
        None,
        "OS",
        ["Activity_Officer_Shift"],
    )

    Treatment_Chemical_Plant_Aquatic = (
        SubtypePrimary.Treatment,
        TreatmentMethod.Chemical,
        Species.AquaticPlant,
        "TCPA",
        ["Activity_Treatment_ChemicalPlantAquatic"],
    )

    Treatment_Chemical_Plant_Terrestrial = (
        SubtypePrimary.Treatment,
        TreatmentMethod.Chemical,
        Species.TerrestrialPlant,
        "TCPT",
        ["Activity_Treatment_ChemicalPlantTerrestrial"],
    )
    Treatment_Mechanical_Plant_Aquatic = (
        SubtypePrimary.Treatment,
        TreatmentMethod.Mechanical,
        Species.AquaticPlant,
        "TMPA",
        ["Activity_Treatment_MechanicalPlantAquatic"],
    )
    Treatment_Mechanical_Plant_Terrestrial = (
        SubtypePrimary.Treatment,
        TreatmentMethod.Mechanical,
        Species.AquaticPlant,
        "TMPT",
        [
            "Activity_Treatment_MechanicalPlantTerrestrial",
            "Treatment - Mechanical - Aquatic Plant",
        ],
    )

    @staticmethod
    def find_by_legacy_database_name(legacy_name: str):
        for st in ActivitySubtypes:
            if legacy_name in st.legacyDatabaseName:
                return st
        return None
