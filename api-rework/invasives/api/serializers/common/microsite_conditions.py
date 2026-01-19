from rest_framework import serializers
from api.models.activity import MicrositeCondition

class MicrositeConditionSerializer(serializers.ModelSerializer):
  class Meta:
    model = MicrositeCondition
    fields = (
      "mesoslope_position",
      "site_surface_shape"
    )
