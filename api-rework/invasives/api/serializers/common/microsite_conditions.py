from rest_framework import serializers
from api.models.activity import MicrositeCondition, DraftMicrositeCondition


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ("mesoslope_position", "site_surface_shape")


class MicrositeConditionSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = MicrositeCondition


class DraftMicrositeConditionSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftMicrositeCondition
