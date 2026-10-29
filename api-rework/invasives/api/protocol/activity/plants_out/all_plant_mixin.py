from abc import ABC
from ninja import Schema
from typing import Optional, List
from django.db.models import Model
from api.models.activity import (
    Activity,
    ObservationType,
    ActivitySubtypes,
    ActivityType,
    # Chem Treatments
    ChemPlantEntryAquatic,
    ChemPlantEntryTerrestrial,
    # Observations
    AquaticPlantObservationEntry,
    TerrestrialPlantObservationEntries,
    # Mech Treatments
    AquaticPlantMechanicalTreatmentEntry,
    TerrestrialPlantMechanicalTreatmentEntry,
    # Monitoring
    AquaticTreatmentMonitoringEntry,
    TerrestrialTreatmentMonitoringEntry,
    # Biocontrol,
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolCollectionEntry,
    # Chem Treatments
    DraftChemPlantEntryAquatic,
    DraftChemPlantEntryTerrestrial,
    # Observations
    DraftAquaticPlantObservationEntry,
    DraftTerrestrialPlantObservationEntries,
    # Mech Treatments
    DraftAquaticPlantMechanicalTreatmentEntry,
    DraftTerrestrialPlantMechanicalTreatmentEntry,
    # Monitoring
    DraftAquaticTreatmentMonitoringEntry,
    DraftTerrestrialTreatmentMonitoringEntry,
    # Biocontrol,
    DraftTerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolDispersalMonitoringEntry,
    DraftTerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolCollectionEntry,
    DraftActivity,
)

type Record = Activity | DraftActivity


PLANT_MAP = {
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
DRAFT_PLANT_MAP = {
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


def _get_paths(obj: Record) -> List[Model]:
    return (
        PLANT_MAP[obj.subtype]
        if isinstance(obj, Activity)
        else DRAFT_PLANT_MAP[obj.subtype]
    )


class AllPlantMixin(Schema, ABC):
    plants: Optional[str]
    positive_plants: Optional[str]
    negative_plants: Optional[str]

    @staticmethod
    def resolve_plants(obj: Record) -> str:
        models: List[Model] = _get_paths(obj)
        plants = []
        for model in models:
            plants += (
                model.objects.filter(
                    activity_data_record__activity_id=obj.id,
                    invasive_plant__isnull=False,
                )
                .distinct("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )
        return ",".join(sorted(set(plants))) or None

    @staticmethod
    def resolve_positive_plants(obj: Record) -> str:
        if obj.type != ActivityType.Observation.value:
            return None
        model: Model = _get_paths(obj)[0]
        return (
            ", ".join(
                model.objects.filter(
                    activity_data_record__activity_id=obj.id,
                    observation_type=ObservationType.Positive.value,
                    invasive_plant__isnull=False,
                )
                .distinct("invasive_plant__full")
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )
            or None
        )

    @staticmethod
    def resolve_negative_plants(obj: Record) -> str:
        if obj.type != ActivityType.Observation.value:
            return None
        model: Model = _get_paths(obj)[0]
        return (
            ", ".join(
                model.objects.filter(
                    activity_data_record__activity_id=obj.id,
                    observation_type=ObservationType.Negative.value,
                    invasive_plant__isnull=False,
                )
                .distinct("invasive_plant__full")
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )
            or None
        )
