from rest_framework import serializers
from api.serializers.common import TerrestrialBiocontrolAgentCountExtendedSerializer
from api.models.activity import (
    LocationBiocontrolAgentsFoundTerrestrial,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    SignOfBiocontrolPresenceTerrestrial,
    TerrestrialBiocontrolAgentCountExtended,
)


class SignOfBiocontrolPresenceTerrestrialSerializer(serializers.ModelSerializer):
    class Meta:
        model = SignOfBiocontrolPresenceTerrestrial
        fields = ["sign_of_presence"]

    def to_representation(self, instance):
        return super().to_representation(instance)["sign_of_presence"]


class LocationBiocontrolAgentsFoundTerrestrialSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationBiocontrolAgentsFoundTerrestrial
        fields = ["location_agent_found"]

    def to_representation(self, instance):
        return super().to_representation(instance)["location_agent_found"]


class TerrestrialBiologicalMonitoringEntriesSerializer(serializers.ModelSerializer):
    """Serializer for Biocontrol Dispersal/Release Monitoring records"""

    biocontrol_present = serializers.SerializerMethodField()
    sign_of_biocontrol_presence = serializers.SerializerMethodField()
    location_agent_found = serializers.SerializerMethodField()
    actual_biological_agents = serializers.SerializerMethodField()
    estimated_biological_agents = serializers.SerializerMethodField()
    start_time = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")
    stop_time = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")

    class Meta:
        model = TerrestrialBiocontrolDispersalMonitoringEntry
        fields = (
            "biocontrol_agent",
            "biocontrol_present",
            "invasive_plant",
            "monitoring_type",
            "plant_count",
            "monitoring_method",
            "count_duration_minutes",
            "location_agent_found",
            "number_of_sweeps",
            "sign_of_biocontrol_presence",
            "start_time",
            "stop_time",
            "linear_segment",
            "suitable_for_collection",
            "actual_biological_agents",
            "estimated_biological_agents",
        )

    def get_actual_biological_agents(self, obj):
        qs = TerrestrialBiocontrolAgentCountExtended.objects.filter(
            activity_data_record=obj.activity_data_record,
            is_estimate=False,
        )
        return TerrestrialBiocontrolAgentCountExtendedSerializer(qs, many=True).data

    def get_estimated_biological_agents(self, obj):
        qs = TerrestrialBiocontrolAgentCountExtended.objects.filter(
            activity_data_record=obj.activity_data_record,
            is_estimate=True,
        )
        return TerrestrialBiocontrolAgentCountExtendedSerializer(qs, many=True).data

    def get_sign_of_biocontrol_presence(self, obj):
        sbpt = SignOfBiocontrolPresenceTerrestrial.objects.filter(
            activity_data_record=obj.activity_data_record,
        )
        return SignOfBiocontrolPresenceTerrestrialSerializer(sbpt, many=True).data

    def get_location_agent_found(self, obj):
        lbaft = LocationBiocontrolAgentsFoundTerrestrial.objects.filter(
            activity_data_record=obj.activity_data_record,
        )
        return LocationBiocontrolAgentsFoundTerrestrialSerializer(lbaft, many=True).data

    def get_biocontrol_present(self, obj):
        # Inferred by sign of biocontrol presence records existing.
        return SignOfBiocontrolPresenceTerrestrial.objects.filter(
            activity_data_record=obj.activity_data_record,
        ).exists()
