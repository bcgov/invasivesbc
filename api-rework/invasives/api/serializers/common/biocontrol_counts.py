from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolAgentCountExtended,
    TerrestrialBiocontrolAgentCount,
)


class TerrestrialBiocontrolAgentCountExtendedSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialBiocontrolAgentCountExtended
        fields = (
            "quantity",
            "stage",
            "plant_position",
            "agent_location",
        )


class TerrestrialBiocontrolAgentCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialBiocontrolAgentCount
        fields = (
            "quantity",
            "stage",
        )
