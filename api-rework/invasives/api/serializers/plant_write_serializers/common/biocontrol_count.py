from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolAgentCount,
    TerrestrialBiocontrolAgentCountExtended,
)


class TerrestrialBiocontrolAgentCountWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialBiocontrolAgentCount
        fields = ("quantity", "stage")


class TerrestrialBiocontrolAgentCountExtendedWriteSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = TerrestrialBiocontrolAgentCountExtended
        fields = ("quantity", "stage", "plant_position", "agent_location")
