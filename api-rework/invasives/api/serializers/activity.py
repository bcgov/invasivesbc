from rest_framework import serializers

from api.models.activity.activity_basic import ActivityBasic
from api.models.activity import Employer, FundingAgency, Jurisdiction, Participant, ProjectCode

"""
Serializers for all Common models in an Activity
"""

class EmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employer
        fields = ("employer")

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

class ProjectCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCode
        fields = ("description")

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
    jurisdictions = JurisdictionSerializer(source='jurisdiction_set', many=True)
    project_code = ProjectCodeSerializer(source="projectcode_set", many=True)
    invasive_species_agency_code = serializers.SerializerMethodField()
    employer_code = serializers.SerializerMethodField()

    class Meta:
        model = ActivityBasic
        fields = "__all__"

    def get_invasive_species_agency_code(self, obj):
        agencies = obj.fundingagency_set.all().values_list('agency_id', flat=True)
        return ",".join(agencies) or None

    def get_employer_code(self, obj):
        employers = obj.employer_set.all().values_list('employer_id', flat=True)
        return ",".join(employers) or None
