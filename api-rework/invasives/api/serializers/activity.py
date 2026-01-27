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


class EmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employer
        fields = ["employer"]


class FundingAgencySerializer(serializers.ModelSerializer):
    invasive_species_agency_code = serializers.CharField(source="agency_id")

    class Meta:
        model = FundingAgency
        fields = ["invasive_species_agency_code"]

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
    projects = ProjectCodeSerializer(source="projectcode_set", many=True)
    funding_agencies = FundingAgencySerializer(source="fundingagency_set", many=True)
    employer = EmployerSerializer(source="employer_set", many=True)
    subtype_data = serializers.SerializerMethodField()
    participants = ParticipantSerializer(source="participant_set", many=True)

    class Meta:
        model = Activity
        fields = (
            # Identifiers
            "short_id",
            "id",
            "created_by",
            "form_status",
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
        )

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
