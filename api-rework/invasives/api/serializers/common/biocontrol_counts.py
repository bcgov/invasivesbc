from rest_framework import serializers
from api.models.activity import TerrestrialBiocontrolAgentCountComplex, TerrestrialBiocontrolAgentCountSimple

class TerrestrialBiocontrolAgentCountComplexSerializer(serializers.ModelSerializer):
  class Meta:
    model = TerrestrialBiocontrolAgentCountComplex
    fields = (
      "quantity",
      "biocontrol_agent",
      "stage",
      "invasive_plant",
      "plant_position",
      "agent_location",
    )

class TerrestrialBiocontrolAgentCountSimpleSerializer(serializers.ModelSerializer):
  class Meta:
    model = TerrestrialBiocontrolAgentCountSimple
    fields = (
      "quantity",
      "biocontrol_agent",
      "stage",
      "invasive_plant"
    )
