import datetime
from typing import List, Optional
import json

from django.db.models import Model
from ninja import ModelSchema
from geojson_pydantic import Point
from pydantic import UUID4, Field
from api.models.activity import (
    Activity,
    ActivitySubtypes,
    ActivityType,
    RisoArea,
    ProjectCode,
    FundingAgency,
    Jurisdiction,
    TerrestrialBiocontrolReleaseEntry,
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
    TerrestrialBiocontrolDispersalMonitoringEntry,
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolCollectionEntry,
)
from api.models.enums.observation_type import ObservationType
from api.models.audits import ActivityModificationRecord


class ActivityPlantRowOut(ModelSchema):
    activity_id: UUID4 = Field(..., alias="id")
    activity_date: datetime.date = Field(..., alias="date")
    activity_type: str = Field(..., alias="type")
    created_by: str
    short_id: str
    geom: Optional[Point] = None
    activity_subtype: str
    elevation: Optional[int] = Field(..., alias="computed_elevation_m")
    biogeoclimatic_zones: Optional[str] = Field(
        ..., alias="computed_biogeoclimatic_zone"
    )
    regional_districts: Optional[str] = Field(..., alias="computed_regional_districts")
    invasive_plant_management_areas: Optional[str] = Field(
        ..., alias="computed_invasive_plant_management_areas"
    )
    regional_invasive_species_organization_areas: Optional[str] = None
    agency: Optional[str] = None
    updated_by: str
    species_biocontrol_full: Optional[str] = None
    species_treated_full: Optional[str] = None
    species_negative_full: Optional[str] = None
    species_positive_full: Optional[str] = None
    invasive_plant: Optional[str] = None
    jurisdiction_display: Optional[str] = None
    project_code: Optional[str] = None

    class Meta:
        model = Activity
        fields = [
            "short_id",
            "batch_id",
        ]

    @staticmethod
    def resolve_activity_subtype(obj: Activity):
        return ActivitySubtypes[obj.subtype].readableFormat

    @staticmethod
    def resolve_geom(obj: Activity):
        return json.loads(obj.shape.point_on_surface.geojson)

    @staticmethod
    def resolve_regional_invasive_species_organization_areas(obj: Activity):
        return (
            ", ".join(
                RisoArea.objects.filter(activity_data_record__activity_id=obj.id)
                .distinct("organization")
                .order_by("organization")
                .values_list("organization", flat=True)
            )
            or None
        )

    @staticmethod
    def resolve_agency(obj: Activity):
        return (
            ",".join(
                FundingAgency.objects.filter(activity_data_record__activity_id=obj.id)
                .distinct("agency__full")
                .order_by("agency__full")
                .values_list("agency__full", flat=True)
            )
            or None
        )

    @staticmethod
    def resolve_updated_by(obj: Activity):
        """Get last update record, or return creator name if absent"""
        if update := ActivityModificationRecord.objects.filter(activity=obj).last():
            return update.user.display_name
        return obj.creating_user.display_name

    @staticmethod
    def resolve_species_biocontrol_full(obj: Activity):
        if obj.type != ActivityType.Biocontrol.value:
            return None
        config = ActivityPlantRowOut.get_agent_model(obj)
        if not config:
            return None
        model: Model = config.model
        return ", ".join(
            model.objects.filter(activity_data_record__activity_id=obj.id).values_list(
                config.key
            )
        )

    @staticmethod
    def resolve_species_treated_full(obj: Activity):
        models: List[Model] = ActivityPlantRowOut.get_plant_models(obj)
        plants = []
        for model in models:
            plants += (
                model.objects.filter(activity_data_record__activity_id=obj.id)
                .distinct("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )
        return ",".join(sorted(set(plants))) or None

    @staticmethod
    def resolve_species_negative_full(obj: Activity):
        if obj.type != ActivityType.Observation.value:
            return None
        model: Model = ActivityPlantRowOut.get_plant_models(obj)[0]
        return (
            ", ".join(
                model.objects.filter(
                    activity_data_record__activity_id=obj.id,
                    observation_type=ObservationType.Negative.value,
                )
                .distinct("invasive_plant__full")
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )
            or None
        )

    @staticmethod
    def resolve_species_positive_full(obj: Activity):
        if obj.type != ActivityType.Observation.value:
            return None
        model: Model = ActivityPlantRowOut.get_plant_models(obj)[0]
        return (
            ", ".join(
                model.objects.filter(
                    activity_data_record__activity_id=obj.id,
                    observation_type=ObservationType.Positive.value,
                )
                .distinct("invasive_plant__full")
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )
            or None
        )

    @staticmethod
    def resolve_invasive_plant(obj: Activity):
        models: List[Model] = ActivityPlantRowOut.get_plant_models(obj)
        plants = []
        for model in models:
            plants += (
                model.objects.filter(activity_data_record__activity_id=obj.id)
                .distinct("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )
        return ",".join(sorted(set(plants))) or None

    @staticmethod
    def resolve_jurisdiction_display(obj: Activity):
        jur = (
            Jurisdiction.objects.filter(activity_data_record__activity_id=obj.id)
            .order_by("jurisdiction__full")
            .values_list("jurisdiction__full", "percent_covered")
        )

        return ", ".join([f"{j} ({p}%)" for j, p in jur]) or None

    @staticmethod
    def resolve_project_code(obj: Activity):
        return (
            ", ".join(
                ProjectCode.objects.filter(
                    activity_data_record__activity_id=obj.id
                ).values_list("description", flat=True)
            )
            or None
        )

    @classmethod
    def get_plant_models(cls, obj: Activity) -> List[Model]:
        MAP = {
            ActivitySubtypes.Biocontrol_Collection.name: [
                TerrestrialBiocontrolCollectionEntry
            ],
            ActivitySubtypes.Biocontrol_Release.name: [
                TerrestrialBiocontrolReleaseEntry
            ],
            ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: [
                TerrestrialBiocontrolDispersalMonitoringEntry
            ],
            ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: [
                TerrestrialBiocontrolDispersalMonitoringEntry
            ],
            ActivitySubtypes.Observation_Plant_Aquatic.name: [
                AquaticPlantObservationEntry
            ],
            ActivitySubtypes.Observation_Plant_Terrestrial.name: [
                TerrestrialPlantObservationEntries
            ],
            ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: [
                ChemPlantEntryTerrestrial
            ],
            ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: [
                ChemPlantEntryAquatic
            ],
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
        return MAP.get(obj.subtype, [])

    @classmethod
    def get_agent_model(cls, obj: Activity) -> dict:
        MAP = {
            ActivitySubtypes.Biocontrol_Collection.name: {
                "model": TerrestrialBiocontrolCollectionEntry,
                "key": "biological_agent",
            },
            ActivitySubtypes.Biocontrol_Release.name: {
                "model": TerrestrialBiocontrolReleaseEntry,
                "key": "biocontrol_agent",
            },
            ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: {
                "model": TerrestrialBiocontrolDispersalMonitoringEntry,
                "key": "biocontrol_agent",
            },
            ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: {
                "model": TerrestrialBiocontrolDispersalMonitoringEntry,
                "key": "biocontrol_agent",
            },
        }
        return MAP.get(obj.subtype, None)
