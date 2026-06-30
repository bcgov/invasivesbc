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
from api.models.activity.activity import Activity
from api.models.activity import UploadedImage
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
    encoded_file = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = UploadedImage
        fields = (
            "file_name",
            "description",
            "encoded_file",
        )

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Inject the base64 string from S3 into the response
        try:
            ret["encoded_file"] = S3MediaFiles().get_b64_encoded_image(
                instance.file_name
            )
        except Exception:
            ret["encoded_file"] = None
        return ret


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
        if not obj.shape:  # Shouldn't happen outside of Draft Records.
            return None
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
