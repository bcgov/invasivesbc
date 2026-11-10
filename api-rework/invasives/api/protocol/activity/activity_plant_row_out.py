import datetime
from typing import List, Optional
import json

from django.db.models import Model
from ninja import ModelSchema
from geojson_pydantic import Feature, Point
from pydantic import UUID4, Field
from api.protocol.activity.plants_out import PlantRecordOut
from api.constants import ACTIVITY_TO_PLANT, DRAFT_ACTIVITY_TO_PLANT
from api.models.activity import (
    Activity,
    ActivitySubtypes,
    ActivityType,
    RisoArea,
    ProjectCode,
    FundingAgency,
    Jurisdiction,
    DraftActivity,
    DraftProjectCode,
    DraftFundingAgency,
    DraftJurisdiction,
    # Biocontrol,
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolCollectionEntry,
    DraftTerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolDispersalMonitoringEntry,
    DraftTerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolCollectionEntry,
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
    reported_area: Optional[int] = Field(..., alias="area_m")
    agency: Optional[str] = None
    updated_by: Optional[str] = None
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
        return json.loads(
            obj.computed_tile_shape.transform(4326, clone=True).point_on_surface.geojson
        )

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
            ", ".join(
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

        model: Model = ActivityPlantRowOut.get_agent_model(obj)
        if not model:
            return None
        return (
            ", ".join(
                model.objects.filter(
                    activity_data_record__activity_id=obj.id
                ).values_list("biocontrol_agent__full", flat=True)
            )
            or None
        )

    @staticmethod
    def resolve_species_treated_full(obj: Activity):
        if obj.type == ActivityType.Observation.value:
            return None
        models: List[Model] = ActivityPlantRowOut.get_plant_models(obj)
        plants = []
        for model in models:
            plants += (
                model.objects.filter(activity_data_record__activity_id=obj.id)
                .distinct("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )
        return ", ".join(sorted(set(plants))) or None

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
    def resolve_created_by(obj: Activity):
        if not obj.creating_user:
            return obj.created_by
        return obj.creating_user.display_name

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
        return ", ".join(sorted(set(plants))) or None

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
        return ACTIVITY_TO_PLANT.get(obj.subtype, [])

    @classmethod
    def get_agent_model(cls, obj: Activity) -> dict:
        MAP = {
            ActivitySubtypes.Biocontrol_Collection.name: TerrestrialBiocontrolCollectionEntry,
            ActivitySubtypes.Biocontrol_Release.name: TerrestrialBiocontrolReleaseEntry,
            ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: TerrestrialBiocontrolDispersalMonitoringEntry,
            ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: TerrestrialBiocontrolDispersalMonitoringEntry,
        }
        return MAP.get(obj.subtype, None)


class DraftActivityPlantRowOut(ActivityPlantRowOut):
    elevation: Optional[int] = None
    biogeoclimatic_zones: Optional[str] = None
    regional_districts: Optional[str] = None
    invasive_plant_management_areas: Optional[str] = None

    class Meta(ActivityPlantRowOut.Meta):
        model = DraftActivity

    @staticmethod
    def resolve_activity_subtype(obj: DraftActivity):
        return ActivitySubtypes[obj.subtype].readableFormat

    @staticmethod
    def resolve_geom(obj: DraftActivity):
        if obj.computed_tile_shape:
            return json.loads(
                obj.computed_tile_shape.transform(
                    4326, clone=True
                ).point_on_surface.geojson
            )
        return None

    @staticmethod
    def resolve_regional_invasive_species_organization_areas(obj: DraftActivity):
        return None

    @staticmethod
    def resolve_agency(obj: DraftActivity):
        return (
            ", ".join(
                DraftFundingAgency.objects.filter(
                    activity_data_record__activity_id=obj.id, agency__isnull=False
                )
                .distinct("agency__full")
                .order_by("agency__full")
                .values_list("agency__full", flat=True)
            )
            or None
        )

    @staticmethod
    def resolve_updated_by(obj: DraftActivity):
        return obj.created_by

    @staticmethod
    def resolve_species_biocontrol_full(obj: DraftActivity):
        if obj.type != ActivityType.Biocontrol.value:
            return None

        model: Model = DraftActivityPlantRowOut.get_agent_model(obj)
        if not model:
            return None
        return (
            ", ".join(
                model.objects.filter(
                    activity_data_record__activity_id=obj.id,
                    biocontrol_agent__isnull=False,
                ).values_list("biocontrol_agent__full", flat=True)
            )
            or None
        )

    @staticmethod
    def resolve_species_treated_full(obj: DraftActivity):
        if obj.type == ActivityType.Observation.value:
            return None
        models: List[Model] = DraftActivityPlantRowOut.get_plant_models(obj)
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
        return ", ".join(sorted(set(plants))) or None

    @staticmethod
    def resolve_species_negative_full(obj: DraftActivity):
        if obj.type != ActivityType.Observation.value:
            return None
        model: Model = DraftActivityPlantRowOut.get_plant_models(obj)[0]
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

    @staticmethod
    def resolve_created_by(obj: DraftActivity):
        if not obj.creating_user:
            return obj.created_by
        return obj.creating_user.display_name

    @staticmethod
    def resolve_species_positive_full(obj: DraftActivity):
        if obj.type != ActivityType.Observation.value:
            return None
        model: Model = DraftActivityPlantRowOut.get_plant_models(obj)[0]
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
    def resolve_invasive_plant(obj: DraftActivity):
        models: List[Model] = DraftActivityPlantRowOut.get_plant_models(obj)
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
        return ", ".join(sorted(set(plants))) or None

    @staticmethod
    def resolve_jurisdiction_display(obj: DraftActivity):
        jur = (
            DraftJurisdiction.objects.filter(
                activity_data_record__activity_id=obj.id, jurisdiction__isnull=False
            )
            .order_by("jurisdiction__full")
            .values_list("jurisdiction__full", "percent_covered")
        )

        return ", ".join([f"{j} ({p}%)" for j, p in jur]) or None

    @staticmethod
    def resolve_project_code(obj: DraftActivity):
        return (
            ", ".join(
                DraftProjectCode.objects.filter(
                    activity_data_record__activity_id=obj.id, description__isnull=False
                ).values_list("description", flat=True)
            )
            or None
        )

    @classmethod
    def get_plant_models(cls, obj: DraftActivity) -> List[Model]:
        return DRAFT_ACTIVITY_TO_PLANT.get(obj.subtype, [])

    @classmethod
    def get_agent_model(cls, obj: DraftActivity) -> dict:
        MAP = {
            ActivitySubtypes.Biocontrol_Collection.name: DraftTerrestrialBiocontrolCollectionEntry,
            ActivitySubtypes.Biocontrol_Release.name: DraftTerrestrialBiocontrolReleaseEntry,
            ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: DraftTerrestrialBiocontrolDispersalMonitoringEntry,
            ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: DraftTerrestrialBiocontrolDispersalMonitoringEntry,
        }
        return MAP.get(obj.subtype, None)


class CachedActivityPlantRowOut(ActivityPlantRowOut):
    """Stack Metadata for Cached recordsets tile layers"""

    data: PlantRecordOut
    centroid: Optional[Feature] = None
    geom: Optional[Feature] = None

    @staticmethod
    def resolve_data(obj: Activity):
        return obj

    @staticmethod
    def resolve_geom(obj: Activity):
        if obj.computed_tile_shape:
            return {
                "type": "Feature",
                "geometry": json.loads(
                    obj.computed_tile_shape.transform(4326, clone=True).geojson
                ),
                "properties": {
                    "description": obj.id,
                    "id": obj.id,
                    "short_id": obj.short_id,
                    "type": obj.type,
                    "subtype": obj.subtype,
                    "map_symbol": obj.computed_map_symbol,
                },
            }
        return None

    @staticmethod
    def resolve_centroid(obj: Activity):
        if obj.computed_tile_shape:
            return {
                "type": "Feature",
                "geometry": json.loads(
                    obj.computed_tile_shape.point_on_surface.transform(
                        4326, clone=True
                    ).geojson
                ),
                "properties": {
                    "description": obj.id,
                    "id": obj.id,
                    "short_id": obj.short_id,
                    "type": obj.type,
                    "subtype": obj.subtype,
                    "map_symbol": obj.computed_map_symbol,
                },
            }
        return None
