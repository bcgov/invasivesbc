from rest_framework import serializers
from api.models.activity import (
  WeatherConditions,
  MicrositeCondition,
  TerrestrialBiocontrolRelease,
  TerrestrialBiocontrolAgentCountSimple,
)
from api.serializers.common import (
  TerrestrialBiocontrolAgentCountSimpleSerializer,
  TargetPlantPhenologySerializer,
  MicrositeConditionSerializer,
  WeatherConditionsSerializer
)

class TerrestrialBiocontrolReleaseSerializer(serializers.ModelSerializer):
  actual_biological_agents = serializers.SerializerMethodField()
  estimated_biological_agents = serializers.SerializerMethodField()

  class Meta:
    model = TerrestrialBiocontrolRelease
    fields = (
      "actual_biological_agents",
      "agent_source",
      "biocontrol_agent",
      "collection_date",
      "estimated_biological_agents",
      "invasive_plant",
      "mortality",
      "plant_collected_from",
      "plant_collected_from_manual",
    )

  def get_actual_biological_agents(self, obj):
    qs = TerrestrialBiocontrolAgentCountSimple.objects.filter(
      activity=obj.activity,
      is_estimate=False,
      invasive_plant=obj.invasive_plant,
      biocontrol_agent=obj.biocontrol_agent
    )
    return TerrestrialBiocontrolAgentCountSimpleSerializer(qs, many=True).data

  def get_estimated_biological_agents(self, obj):
    qs = TerrestrialBiocontrolAgentCountSimple.objects.filter(
      activity=obj.activity,
      is_estimate=True,
      invasive_plant=obj.invasive_plant,
      biocontrol_agent=obj.biocontrol_agent
    )
    return TerrestrialBiocontrolAgentCountSimpleSerializer(qs, many=True).data

class BiocontrolReleaseSerializer(serializers.Serializer):
  biological_treatment_information = TerrestrialBiocontrolReleaseSerializer(source="terrestrialbiocontrolrelease_set", many=True)
  target_plant_phenology = TargetPlantPhenologySerializer(source="targetplantphenology")
  microsite_condition = MicrositeConditionSerializer(source="micrositecondition")
  weather_conditions = WeatherConditionsSerializer(source="weatherconditions")
