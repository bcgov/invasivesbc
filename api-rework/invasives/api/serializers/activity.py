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
    DraftEmployer,
    DraftFundingAgency,
    DraftJurisdiction,
    DraftParticipant,
    DraftProjectCode,
)
from api.models.activity.activity import Activity, DraftActivity
from api.models.activity import UploadedImage, DraftUploadedImage
from api.serializers.common import (
    UploadedImageSerializer,
    DraftUploadedImageSerializer,
    EmployerSerializer,
    DraftEmployerSerializer,
    FundingAgencySerializer,
    DraftFundingAgencySerializer,
    JurisdictionSerializer,
    DraftJurisdictionSerializer,
    ParticipantSerializer,
    DraftParticipantSerializer,
    ProjectCodeSerializer,
    DraftProjectCodeSerializer,
)
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
    DraftAquaticChemicalTreatmentSerializer,
    DraftAquaticObservationSerializer,
    DraftAquaticPlantTreatmentMechanicalSerializer,
    DraftBiocontrolCollectionSerializer,
    DraftBiocontrolDispersalMonitoringSerializer,
    DraftBiocontrolReleaseMonitoringSerializer,
    DraftBiocontrolReleaseSerializer,
    DraftChemicalMonitoringSerializer,
    DraftMechanicalMonitoringSerializer,
    DraftTerrestrialChemicalTreatmentSerializer,
    DraftTerrestrialObservationSerializer,
    DraftTerrestrialPlantTreatmentMechanicalSerializer,
)


class BaseSerializer(serializers.ModelSerializer):
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

    class Meta:
        abstract = True
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


class ActivitySerializer(BaseSerializer):
    """
    Entry For Serializing Activities to a Record
    """

    class Meta(BaseSerializer.Meta):
        model = Activity

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

    def get_linked_activities(self, obj):
        arr = []
        for linked_id in obj.linked_activities.all():
            arr.append(
                {
                    "label": f"{linked_id.short_id},{linked_id.date},{linked_id.created_by}",
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
        return json.loads(obj.shape.point_on_surface.json)

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


class DraftActivitySerializer(BaseSerializer):
    """
    Entry For Serializing Activities to a Record
    """

    class Meta(BaseSerializer.Meta):
        model = DraftActivity

    def get_jurisdictions(self, obj):
        children = DraftJurisdiction.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftJurisdictionSerializer(children, many=True).data

    def get_funding_agencies(self, obj):
        children = DraftFundingAgency.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftFundingAgencySerializer(children, many=True).data

    def get_participants(self, obj):
        children = DraftParticipant.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftParticipantSerializer(children, many=True).data

    def get_projects(self, obj):
        children = DraftProjectCode.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftProjectCodeSerializer(children, many=True).data

    def get_employer(self, obj):
        children = DraftEmployer.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftEmployerSerializer(children, many=True).data

    def get_media(self, obj):
        children = DraftUploadedImage.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftUploadedImageSerializer(children, many=True).data

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

    def get_shape(self, obj: DraftActivity):
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
        return json.loads(obj.shape.point_on_surface.json)

    def get_subtype_data(self, obj: DraftActivity):
        """Maps the Activity to the proper Subtype Serializer, populating the form specific information"""
        SUBTYPE_SERIALIZER_MAP = {
            ActivitySubtypes.Observation_Plant_Terrestrial.name: DraftTerrestrialObservationSerializer,
            ActivitySubtypes.Observation_Plant_Aquatic.name: DraftAquaticObservationSerializer,
            ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: DraftTerrestrialPlantTreatmentMechanicalSerializer,
            ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: DraftAquaticPlantTreatmentMechanicalSerializer,
            ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: DraftMechanicalMonitoringSerializer,
            ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: DraftChemicalMonitoringSerializer,
            ActivitySubtypes.Biocontrol_Release.name: DraftBiocontrolReleaseSerializer,
            ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: DraftBiocontrolReleaseMonitoringSerializer,
            ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: DraftBiocontrolDispersalMonitoringSerializer,
            ActivitySubtypes.Biocontrol_Collection.name: DraftBiocontrolCollectionSerializer,
            ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: DraftAquaticChemicalTreatmentSerializer,
            ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: DraftTerrestrialChemicalTreatmentSerializer,
        }
        serializer_cls = SUBTYPE_SERIALIZER_MAP.get(obj.subtype)

        if not serializer_cls:
            logging.warning(
                "No serializer found for draft activity subtype: %s", obj.subtype
            )
            return None

        return serializer_cls(obj, context=self.context).data
