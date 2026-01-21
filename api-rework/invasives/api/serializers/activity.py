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
from api.serializers.type.subtype import (
    AquaticObservationSerializer,
    AquaticPlantTreatmentMechanicalSerializer,
    ChemicalMonitoringSerializer,
    MechanicalMonitoringSerializer,
    TerrestrialObservationSerializer,
    TerrestrialPlantTreatmentMechanicalSerializer,
    BiocontrolReleaseSerializer,
    BiocontrolReleaseMonitoringSerializer,
    BiocontrolDispersalMonitoringSerializer
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
        fields = "invasive_species_agency_code"

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
    class Meta:
        model = Activity
        fields = (
            "id",
            "type",
            "subtype",
            "date",
        )


class ActivitySerializer(serializers.ModelSerializer):
    """
    Entry For Serializing Activities to a Record
    """

    jurisdictions = JurisdictionSerializer(source="jurisdiction_set", many=True)
    project_code = ProjectCodeSerializer(source="projectcode_set", many=True)
    funding_agency = serializers.SerializerMethodField()
    employer_code = serializers.SerializerMethodField()
    subtype_data = serializers.SerializerMethodField()
    participants = ParticipantSerializer(source="participant_set", many=True)

    class Meta:
        model = Activity
        fields = "__all__"

    def get_funding_agency(self, obj):
        """Formats Funding agency codes into comma separated format"""
        agencies = obj.fundingagency_set.all().values_list("agency_id", flat=True)
        return ",".join(agencies) or None

    def get_employer_code(self, obj):
        """Formats Employer codes into comma separated format"""
        employers = obj.employer_set.all().values_list("employer_id", flat=True)
        return ",".join(employers) or None

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
            ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: BiocontrolDispersalMonitoringSerializer
        }
        serializer_cls = SUBTYPE_SERIALIZER_MAP.get(obj.subtype)

        if not serializer_cls:
            logging.warning("No serializer found for activity subtype %s", obj.subtype)
            return None

        return serializer_cls(obj, context=self.context).data
