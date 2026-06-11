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
    readableFormat: str


class ActivitySubtypes(ActivitySubtype, Enum):

    Biocontrol_Collection = (
        SubtypePrimary.Biocontrol,
        None,
        None,
        "PBC",
        ["Activity_Biocontrol_Collection"],
        "Biocontrol Collection",
    )

    Biocontrol_Release = (
        SubtypePrimary.Biocontrol,
        None,
        None,
        "PBR",
        ["Activity_Biocontrol_Release"],
        "Biocontrol Release",
    )
    Monitoring_Biocontrol_Dispersal_Plant_Terrestrial = (
        SubtypePrimary.Biocontrol,
        None,
        Species.TerrestrialPlant,
        "PBD",
        ["Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant"],
        "Biocontrol Dispersal Monitoring",
    )
    Monitoring_Biocontrol_Release_Plant_Terrestrial = (
        SubtypePrimary.Biocontrol,
        None,
        Species.TerrestrialPlant,
        "PBM",
        ["Activity_Monitoring_BiocontrolRelease_TerrestrialPlant"],
        "Biocontrol Release Monitoring",
    )
    Monitoring_Chemical_Plant_Terrestrial_Aquatic = (
        SubtypePrimary.Monitoring,
        TreatmentMethod.Chemical,
        Species.TerrestrialPlant | Species.AquaticPlant,
        "PMC",
        ["Activity_Monitoring_ChemicalTerrestrialAquaticPlant"],
        "Chemical Treatment Monitoring",
    )
    Monitoring_Mechanical_Plant_Terrestrial_Aquatic = (
        SubtypePrimary.Monitoring,
        TreatmentMethod.Mechanical,
        Species.TerrestrialPlant | Species.AquaticPlant,
        "PMM",
        ["Activity_Monitoring_MechanicalTerrestrialAquaticPlant"],
        "Mechanical Treatment Monitoring",
    )
    Observation_Mussels = (
        SubtypePrimary.Observation,
        None,
        Species.Mussels,
        "MUS",
        ["Activity_Observation_Mussels"],
        "Activity_Observation_Mussels",
    )
    Observation_Plant_Aquatic = (
        SubtypePrimary.Observation,
        None,
        Species.AquaticPlant,
        "PAO",
        ["Activity_Observation_PlantAquatic"],
        "Aquatic Invasive Plant Observation",
    )

    Observation_Plant_Terrestrial = (
        SubtypePrimary.Observation,
        None,
        Species.TerrestrialPlant,
        "PTO",
        ["Activity_Observation_PlantTerrestrial"],
        "Terrestrial Invasive Plant Observation",
    )

    Officer_Shift = (
        SubtypePrimary.Shift,
        None,
        None,
        "OS",
        ["Activity_Officer_Shift"],
        "Activity_Officer_Shift",
    )

    Treatment_Chemical_Plant_Aquatic = (
        SubtypePrimary.Treatment,
        TreatmentMethod.Chemical,
        Species.AquaticPlant,
        "PAC",
        ["Activity_Treatment_ChemicalPlantAquatic"],
        "Aquatic Plant Treatment - Chemical",
    )

    Treatment_Chemical_Plant_Terrestrial = (
        SubtypePrimary.Treatment,
        TreatmentMethod.Chemical,
        Species.TerrestrialPlant,
        "PTC",
        ["Activity_Treatment_ChemicalPlantTerrestrial"],
        "Terrestrial Plant Treatment - Chemical",
    )
    Treatment_Mechanical_Plant_Aquatic = (
        SubtypePrimary.Treatment,
        TreatmentMethod.Mechanical,
        Species.AquaticPlant,
        "PAM",
        ["Activity_Treatment_MechanicalPlantAquatic"],
        "Aquatic Plant Treatment - Mechanical",
    )
    Treatment_Mechanical_Plant_Terrestrial = (
        SubtypePrimary.Treatment,
        TreatmentMethod.Mechanical,
        Species.AquaticPlant,
        "PTM",
        [
            "Activity_Treatment_MechanicalPlantTerrestrial",
            "Treatment - Mechanical - Aquatic Plant",
        ],
        "Terrestrial Plant Treatment - Mechanical",
    )

    @staticmethod
    def find_by_legacy_database_name(legacy_name: str):
        for st in ActivitySubtypes:
            if legacy_name in st.legacyDatabaseName:
                return st
        raise KeyError(legacy_name)
