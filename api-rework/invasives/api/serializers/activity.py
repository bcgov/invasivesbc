from rest_framework import serializers
import logging

from api.models.activity.activity_basic import ActivityBasic
from api.models.activity import (
    Employer,
    FundingAgency,
    Jurisdiction,
    LinkedRecord,
    Participant,
    ProjectCode,
)
from api.serializers.type.subtype import (
    AquaticObservationSerializer,
    AquaticPlantTreatmentMechanicalSerializer,
    TerrestrialObservationSerializer,
    TerrestrialPlantTreatmentMechanicalSerializer,
    MechanicalMonitoringSerializer,
    ChemicalMonitoringSerializer
)

"""
Serializers for all Common models in an Activity
"""

class EmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employer
        fields = ["employer"]

class FundingAgencySerializer(serializers.ModelSerializer):
    invasive_species_agency_code = serializers.CharField(source="agency_id")
    class Meta:
        model = FundingAgency
        fields = ("invasive_species_agency_code")
    pass

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
            if instance.activity_id.activity_subtype.full in ["Activity_Treatment_ChemicalPlantTerrestrial", "Activity_Monitoring_ChemicalTerrestrialAquaticPlant"]:
                return ret
        except Exception as e:

            pass
        return {"name": ret["name"]}


class LinkedRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkedRecord
        fields = ["linked_id"]
    def to_representation(self, instance):
        """Format Response to return string value"""
        ret = super().to_representation(instance)
        return ret["linked_id"]

class ProjectCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCode
        fields = ["description"]

# class ActivityGeometrySerializer():
# TODO: Implement when Model finalized
    # class Meta:
    #     model = ActivityGeometry
    #     fields = (
    #         "centroid",
    #         "geom",
    #         "area_m",
    #         "utm_zone",
    #         "utm_easting",
    #         "utm_northing",
    #         "latitude",
    #         "longitude",
    #         "location_description"
    #     )

class ActivityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityBasic
        fields = (
            "activity_id",
            "activity_type",
            "activity_subtype",
            "activity_date",
        )


class ActivitySerializer(serializers.ModelSerializer):
    """
    Entry For Serializing Activities to a Record
    """
    jurisdictions = JurisdictionSerializer(source='jurisdiction_set', many=True)
    project_code = ProjectCodeSerializer(source="projectcode_set", many=True)
    funding_agency = serializers.SerializerMethodField()
    employer_code = serializers.SerializerMethodField()
    subtype_data = serializers.SerializerMethodField()
    linked_id = LinkedRecordSerializer(source="links_from", many=True)
    participants = ParticipantSerializer(source="participant_set", many=True)

    class Meta:
        model = ActivityBasic
        fields = "__all__"

    def get_funding_agency(self, obj):
        """Formats Funding agency codes into comma separated format"""
        agencies = obj.fundingagency_set.all().values_list('agency_id', flat=True)
        return ",".join(agencies) or None

    def get_employer_code(self, obj):
        """Formats Employer codes into comma separated format"""
        employers = obj.employer_set.all().values_list('employer_id', flat=True)
        return ",".join(employers) or None

    def get_subtype_data(self, obj):
        """Maps the Activity to the proper Subtype Serializer, populating the form specific information"""

        SUBTYPE_SERIALIZER_MAP = {
            "Activity_Observation_PlantTerrestrial": TerrestrialObservationSerializer,
            "Activity_Observation_PlantAquatic": AquaticObservationSerializer,
            "Activity_Treatment_MechanicalPlantTerrestrial": TerrestrialPlantTreatmentMechanicalSerializer,
            "Activity_Treatment_MechanicalPlantAquatic": AquaticPlantTreatmentMechanicalSerializer,
            "Activity_Monitoring_MechanicalTerrestrialAquaticPlant": MechanicalMonitoringSerializer,
            "Activity_Monitoring_ChemicalTerrestrialAquaticPlant": ChemicalMonitoringSerializer
        }
        serializer_cls = SUBTYPE_SERIALIZER_MAP.get(obj.activity_subtype.full)

        if not serializer_cls:
            return None

        return serializer_cls(obj, context=self.context).data
