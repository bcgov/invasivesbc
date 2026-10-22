import json, uuid
from abc import ABC
from api.models.activity import (
    Activity,
    DraftActivity,
    Jurisdiction,
    ProjectCode,
    FundingAgency,
    Employer,
    Participant,
    UploadedImage,
    DraftJurisdiction,
    DraftProjectCode,
    DraftFundingAgency,
    DraftEmployer,
    DraftParticipant,
    DraftUploadedImage,
)
from api.utils.s3_media_files import S3MediaFiles
from pydantic import ConfigDict, Field
from geojson_pydantic import Point
from api.protocol.activity.activity_plant_row_out import ActivityPlantRowOut
from typing import List, Optional
from ninja import ModelSchema, Schema


class JurisdictionOut(Schema):
    jurisdiction: Optional[str] = Field(..., alias="jurisdiction.code")
    percent_covered: Optional[int] = None


class LinkedActivityOut(Schema):
    label: str
    full: uuid.UUID = Field(..., alias="id")

    @staticmethod
    def resolve_label(obj: Activity):
        creator = (
            obj.creating_user.display_name if obj.creating_user else obj.created_by
        )
        return f"{obj.short_id} | {obj.date} | {creator}"


class ProjectOut(Schema):
    description: Optional[str] = None


class FundingAgencyOut(Schema):
    invasive_species_agency_code: Optional[str] = Field(..., alias="agency.code")


class EmployerOut(Schema):
    employer: Optional[str] = Field(..., alias="employer.code")


class ParticipantOut(Schema):
    name: Optional[str] = None
    pac_number: Optional[int] = None


class UploadedImageOut(Schema):
    encoded_file: Optional[str] = None
    file_name: str
    description: Optional[str] = None

    @staticmethod
    def resolve_encoded_file(obj: UploadedImage):
        try:
            return S3MediaFiles().get_b64_encoded_image(file_name=obj.file_name)
        except Exception as e:
            print(e)
            return None


class BaseRecordOut(ModelSchema, ABC):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    centroid: Point
    employer: List[EmployerOut]
    funding_agencies: List[FundingAgencyOut]
    jurisdictions: List[JurisdictionOut]
    linked_activities: List[LinkedActivityOut]
    media: List[UploadedImageOut]
    participant: List[ParticipantOut]
    projects: List[ProjectOut]
    shape: dict

    class Meta:
        model = Activity
        fields = (
            "short_id",
            "id",
            "created_by",
            "form_status",
            "linked_activities",
            "type",
            "subtype",
            "access_description",
            "comment",
            "date",
            "area_m",
            "utm_zone",
            "utm_easting",
            "utm_northing",
            "location_description",
        )

    @staticmethod
    def resolve_centroid(obj: Activity):
        return json.loads(obj.shape.point_on_surface.geojson)

    @staticmethod
    def resolve_employer(obj: Activity):
        return Employer.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_funding_agencies(obj: Activity):
        return FundingAgency.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_jurisdictions(obj: Activity):
        return Jurisdiction.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_linked_activities(obj: Activity):
        return obj.linked_activities.all()

    @staticmethod
    def resolve_media(obj: Activity):
        return UploadedImage.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_participant(obj: Activity):
        return Participant.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_projects(obj: Activity):
        return ProjectCode.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_shape(obj: Activity):
        geojson_py_object = json.loads(obj.shape.geojson)

        if geojson_py_object["type"] == "Feature":
            return geojson_py_object

        feature_object = {
            "type": "Feature",
            "geometry": geojson_py_object,
            "properties": {"id": obj.short_id},
        }

        if obj.shape_radius is not None:
            feature_object["properties"]["radius"] = obj.shape_radius

        return feature_object


class DraftBaseRecordOut(BaseRecordOut, ABC):
    shape: Optional[dict] = None
    centroid: Optional[Point] = None

    class Meta(BaseRecordOut.Meta):
        model = DraftActivity

    @staticmethod
    def resolve_centroid(obj: Activity):
        if not obj.shape:
            return None
        return json.loads(obj.shape.point_on_surface.geojson)

    @staticmethod
    def resolve_employer(obj: Activity):
        return DraftEmployer.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_funding_agencies(obj: Activity):
        return DraftFundingAgency.objects.filter(
            activity_data_record__activity_id=obj.id
        )

    @staticmethod
    def resolve_jurisdictions(obj: Activity):
        return DraftJurisdiction.objects.filter(
            activity_data_record__activity_id=obj.id
        )

    @staticmethod
    def resolve_linked_activities(obj: Activity):
        return obj.linked_activities.all()

    @staticmethod
    def resolve_media(obj: Activity):
        return DraftUploadedImage.objects.filter(
            activity_data_record__activity_id=obj.id
        )

    @staticmethod
    def resolve_participant(obj: Activity):
        return DraftParticipant.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_projects(obj: Activity):
        return DraftProjectCode.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_shape(obj: Activity):
        if not obj.shape:
            return None

        geojson_py_object = json.loads(obj.shape.geojson)

        if geojson_py_object["type"] == "Feature":
            return geojson_py_object

        feature_object = {
            "type": "Feature",
            "geometry": geojson_py_object,
            "properties": {"id": obj.short_id},
        }

        if obj.shape_radius is not None:
            feature_object["properties"]["radius"] = obj.shape_radius

        return feature_object
