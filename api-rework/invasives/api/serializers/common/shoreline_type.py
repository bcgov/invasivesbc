from rest_framework import serializers

from api.models.activity import ShorelineTypes, DraftShorelineTypes


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ("shoreline_type", "percent_covered")


class ShorelineTypesSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ShorelineTypes


class DraftShorelineTypesSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftShorelineTypes
