from rest_framework import serializers
from api.models.activity import (
    LocationBiocontrolAgentsFoundTerrestrial,
    DraftLocationBiocontrolAgentsFoundTerrestrial,
)


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["location_agent_found"]

    def to_representation(self, instance):
        return super().to_representation(instance)["location_agent_found"]


class LocationBiocontrolAgentsFoundTerrestrialSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = LocationBiocontrolAgentsFoundTerrestrial


class DraftLocationBiocontrolAgentsFoundTerrestrialSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftLocationBiocontrolAgentsFoundTerrestrial
