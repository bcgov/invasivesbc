from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolAgentCountComplex,
    TerrestrialBiocontrolAgentCountSimple,
)


class TerrestrialBiocontrolAgentCountComplexSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialBiocontrolAgentCountComplex
        fields = (
            "quantity",
            "stage",
            "plant_position",
            "agent_location",
        )


class TerrestrialBiocontrolAgentCountSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialBiocontrolAgentCountSimple
        fields = (
            "quantity",
            "stage",
        )
