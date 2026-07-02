from rest_framework import serializers
from api.models.activity import SpecificUse, DraftSpecificUse


class BaseSerializer(serializers.ModelSerializer):
    specific_use = serializers.CharField()

    class Meta:
        abstract = True
        fields = ("specific_use",)


class SpecificUseSerializer(serializers.ModelSerializer):
    class Meta(BaseSerializer.Meta):
        model = SpecificUse


class DraftSpecificUseSerializer(serializers.ModelSerializer):

    class Meta(BaseSerializer.Meta):
        model = DraftSpecificUse
