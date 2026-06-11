import json
import logging

from rest_framework import serializers

from api.models.activity import (
    ActivitySubtypes,
    Employer,
    FundingAgency,
    Jurisdiction,
    Participant,
    ProjectCode,
)
from django.contrib.gis.geos import GEOSGeometry
from api.models.activity.activity import Activity
from api.models.activity import UploadedImage
from api.models.mixins.geometry import Geometry
from api.utils.s3_media_files import S3MediaFiles
from api.serializers.type.subtype import (
    AquaticChemicalTreatmentSerializer,
    AquaticObservationSerializer,
    AquaticPlantTreatmentMechanicalSerializer,
    BiocontrolCollectionSerializer,
    BiocontrolDispersalMonitoringSerializer,
    BiocontrolReleaseMonitoringSerializer,
    BiocontrolReleaseSerializer,
    ChemicalMonitoringSerializer,
    MechanicalMonitoringSerializer,
    TerrestrialChemicalTreatmentSerializer,
    TerrestrialObservationSerializer,
    TerrestrialPlantTreatmentMechanicalSerializer,
)

"""
Serializers for all Common models in an Activity
"""


class UploadedImageSerializer(serializers.ModelSerializer):
    file_name = serializers.CharField()
    description = serializers.CharField()
    encoded_file = serializers.SerializerMethodField()

    class Meta:
        model = UploadedImage
        fields = (
            "file_name",
            "description",
            "encoded_file",
        )

    def get_encoded_file(self, obj):
        encoded_image = S3MediaFiles().get_b64_encoded_image(obj.file_name)
        return encoded_image


class EmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employer
        fields = ["employer"]


class FundingAgencySerializer(serializers.ModelSerializer):
    invasive_species_agency_code = serializers.CharField(source="agency_id")

    class Meta:
        model = FundingAgency
        fields = ["invasive_species_agency_code"]


class JurisdictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jurisdiction
        fields = ("jurisdiction", "percent_covered")


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ("name", "pac_number")

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        try:
            if instance.activity.subtype in [
                ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name,
                ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name,
            ]:
                return ret
        except Exception as e:
            pass
        return {"name": ret["name"]}


class ProjectCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCode
        fields = ["description"]


class ActivityListSerializer(serializers.ModelSerializer):
    has_migration_remarks = serializers.BooleanField(read_only=True)

    class Meta:
        model = Activity
        fields = ("id", "type", "subtype", "date", "has_migration_remarks")


class ActivitySerializer(serializers.ModelSerializer):
    """
    Entry For Serializing Activities to a Record
    """

    jurisdictions = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    funding_agencies = serializers.SerializerMethodField()
    employer = serializers.SerializerMethodField()
    subtype_data = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    linked_activities = serializers.SerializerMethodField()

    shape = serializers.SerializerMethodField()
    centroid = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()

    def get_jurisdictions(self, obj):
        children = Jurisdiction.objects.filter(activity_data_record__activity_id=obj.id)
        return JurisdictionSerializer(children, many=True).data

    def get_funding_agencies(self, obj):
        children = FundingAgency.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return FundingAgencySerializer(children, many=True).data

    def get_participants(self, obj):
        children = Participant.objects.filter(activity_data_record__activity_id=obj.id)
        return ParticipantSerializer(children, many=True).data

    def get_projects(self, obj):
        children = ProjectCode.objects.filter(activity_data_record__activity_id=obj.id)
        return ProjectCodeSerializer(children, many=True).data

    def get_employer(self, obj):
        children = Employer.objects.filter(activity_data_record__activity_id=obj.id)
        return EmployerSerializer(children, many=True).data

    def get_media(self, obj):
        children = UploadedImage.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return UploadedImageSerializer(children, many=True).data

    class Meta:
        model = Activity
        fields = (
            # Identifiers
            "short_id",
            "id",
            "created_by",
            "form_status",
            "linked_activities",
            # Record type details
            "type",
            "subtype",
            # Top level form details
            "access_description",
            "comment",
            "date",
            "employer",
            "funding_agencies",
            "jurisdictions",
            "participants",
            "projects",
            "subtype_data",
            # Geographic Detail
            "area_m",
            "latitude",
            "longitude",
            "utm_zone",
            "utm_easting",
            "utm_northing",
            "location_description",
            "shape",
            "centroid",
            "media",
            "migration_remarks",
        )

    def get_linked_activities(self, obj):
        arr = []
        for linked_id in obj.linked_activities.all():
            arr.append(
                {
                    "label": f"{linked_id.short_id} | {linked_id.date} | {linked_id.created_by}",
                    "full": linked_id.id,
                }
            )
        return arr

    def get_shape(self, obj: Activity):
        geojson_py_object = json.loads(obj.shape.json)

        if geojson_py_object["type"] == "Feature":
            # Shouldn't be any
            logging.warning("Unexpected geometry with type Feature")
            return geojson_py_object

        feature_object = {
            "type": "Feature",
            "geometry": geojson_py_object,
            "properties": {"id": obj.short_id},
        }

        if obj.shape_radius is not None:
            feature_object["properties"]["radius"] = obj.shape_radius

        return feature_object

    def get_centroid(self, obj):
        if not obj.shape:
            return None
        centroid = obj.shape.centroid
        return json.loads(centroid.json)

    def get_subtype_data(self, obj: Activity):
        """Maps the Activity to the proper Subtype Serializer, populating the form specific information"""
        SUBTYPE_SERIALIZER_MAP = {
            ActivitySubtypes.Observation_Plant_Terrestrial.name: TerrestrialObservationSerializer,
            ActivitySubtypes.Observation_Plant_Aquatic.name: AquaticObservationSerializer,
            ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: TerrestrialPlantTreatmentMechanicalSerializer,
            ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: AquaticPlantTreatmentMechanicalSerializer,
            ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: MechanicalMonitoringSerializer,
            ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: ChemicalMonitoringSerializer,
            ActivitySubtypes.Biocontrol_Release.name: BiocontrolReleaseSerializer,
            ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: BiocontrolReleaseMonitoringSerializer,
            ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: BiocontrolDispersalMonitoringSerializer,
            ActivitySubtypes.Biocontrol_Collection.name: BiocontrolCollectionSerializer,
            ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: AquaticChemicalTreatmentSerializer,
            ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: TerrestrialChemicalTreatmentSerializer,
        }
        serializer_cls = SUBTYPE_SERIALIZER_MAP.get(obj.subtype)

        if not serializer_cls:
            logging.warning("No serializer found for activity subtype %s", obj.subtype)
            return None

        return serializer_cls(obj, context=self.context).data


class ActivityWriteSerializer(serializers.ModelSerializer):
    linked_activities = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Activity.objects.all(), required=False, allow_empty=True
    )

    shape = serializers.JSONField(required=False)
    id = serializers.UUIDField(required=False)

    class Meta:
        model = Activity
        fields = [
            "id",
            "short_id",
            "type",
            "subtype",
            "date",
            "created_by",
            "form_status",
            "access_description",
            "comment",
            "linked_activities",
            "migration_remarks",
            "shape",
            "utm_easting",
            "utm_northing",
            "utm_zone",
            "latitude",
            "longitude",
            "location_description",
            "area_m",
            "batch_id",
            "batch_row_id",
            "shape_radius",
            "comment",
        ]
        extra_kwargs = {
            "short_id": {"read_only": True},
        }

    def validate_shape(self, value):
        if value is None:
            return None
        geometry = value.get("geometry", value)
        return GEOSGeometry(json.dumps(geometry))

    def to_internal_value(self, data):
        linked = data.get("linked_activities")

        if linked and isinstance(linked, list):
            cleaned = []
            for item in linked:
                if isinstance(item, dict) and "full" in item:
                    cleaned.append(item["full"])
                else:
                    cleaned.append(item)
            data["linked_activities"] = cleaned

        return super().to_internal_value(data)

    def create(self, validated_data):
        linked = validated_data.pop("linked_activities", [])
        instance = Activity.objects.create(**validated_data)
        instance.linked_activities.set(linked)
        return instance

    def update(self, instance, validated_data):
        linked = validated_data.pop("linked_activities", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        if linked is not None:
            instance.linked_activities.set(linked)
        return instance
