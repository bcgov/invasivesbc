from api.models.activity import (
    Activity,
    RisoArea,
    ActivitySubtypes,
    UploadedImage,
    Participant,
    Employer,
    Jurisdiction,
    ProjectCode,
    FundingAgency,
)
from abc import ABC, abstractmethod
from typing import Type
from django.db import models
from celery.utils.log import get_task_logger


class CsvTransformerBase[T: models.Model, U: models.Model](ABC):
    csv_model: Type[T]
    entry_model: Type[U]
    logger = get_task_logger(__name__)

    def __init__(self, id: str):
        self.base_record = Activity.objects.get(id=id)
        self.id = id
        self.entries: models.QuerySet[U] = self.entry_model.objects.filter(
            activity_data_record__activity_id=id
        )

    def safe_attr(self, obj, *attrs, default=None):
        for attr in attrs:
            if obj is None:
                return default
            obj = getattr(obj, attr, default)
        return obj

    def get_common_fields(self) -> dict[str, T]:
        activity = self.base_record
        """
        Get a mock model with all common fields shared between exports.
        """
        base = {
            "activity_id": activity,
            "short_id": activity.short_id,
            "date": activity.date,
            "area_m": activity.area_m,
            "latitude": activity.latitude,
            "longitude": activity.longitude,
            "utm_zone": activity.utm_zone,
            "utm_easting": activity.utm_easting,
            "utm_northing": activity.utm_northing,
            "location_description": activity.location_description,
            "access_description": activity.access_description,
            "general_comment": activity.comment,
            "batch_id": activity.batch_id,
            "computed_invasive_plant_management_area": activity.computed_invasive_plant_management_areas,
            "computed_ownership": activity.computed_ownership,
            "computed_regional_districts": activity.computed_regional_districts,
            "computed_flrno_districts": activity.computed_flrno_districts,
            "computed_moti_districts": activity.computed_moti_districts,
            "computed_biogeoclimatic_zones": activity.computed_biogeoclimatic_zone,
            "computed_elevation_m": activity.computed_elevation_m,
            "created_timestamp": activity.created_timestamp,
            "shape": activity.shape,
        }
        has_photo = UploadedImage.objects.filter(
            activity_data_record__activity_id=activity.id
        ).exists()
        base["has_photo"] = "Yes" if has_photo else "No"

        project_codes = ProjectCode.objects.filter(
            activity_data_record__activity_id=activity.id
        ).values_list("description", flat=True)

        base["project_code_one"] = project_codes[0] if len(project_codes) >= 1 else None
        base["project_code_two"] = project_codes[1] if len(project_codes) >= 2 else None

        employers = Employer.objects.filter(
            activity_data_record__activity_id=activity.id
        ).values_list("employer__full", flat=True)
        base["employers"] = ", ".join(employers) or None

        agencies = FundingAgency.objects.filter(
            activity_data_record__activity_id=activity.id
        ).values_list("agency__full", flat=True)
        base["agencies"] = ", ".join(agencies) or None

        jurisdictions = Jurisdiction.objects.filter(
            activity_data_record__activity_id=activity.id
        ).values_list("jurisdiction__full", "percent_covered")

        base["jurisdictions"] = (
            ", ".join(f"{name} ({percent}%)" for name, percent in jurisdictions) or None
        )

        is_chemical_treatment = activity.subtype in [
            ActivitySubtypes.Treatment_Chemical_Plant_Aquatic,
            ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial,
        ]
        participants = Participant.objects.filter(
            activity_data_record__activity_id=activity.id
        ).values_list("name", "pac_number")
        base["participants"] = (
            ", ".join(
                f"{name} (PAC: {pac})" if is_chemical_treatment else name
                for name, pac in participants
            )
            or None
        )

        risos = RisoArea.objects.filter(
            activity_data_record__activity_id=activity.id
        ).values_list("organization", flat=True)
        base["computed_riso_areas"] = ", ".join(risos) or None

        return base

    def start_conversion(self):
        self.csv_model.objects.filter(activity_id=self.id).delete()
        common_fields = self.get_common_fields()
        self.build_rows(common_fields=common_fields)

    @abstractmethod
    def build_rows(self, common_fields: dict[str, T]):
        """
        Creates CSV Model entries Record.
        """
        pass
