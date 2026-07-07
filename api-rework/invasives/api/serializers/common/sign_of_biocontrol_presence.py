from rest_framework import serializers
from api.models.activity import (
    SignOfBiocontrolPresenceTerrestrial,
    DraftSignOfBiocontrolPresenceTerrestrial,
)


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["sign_of_presence"]

    def to_representation(self, instance):
        return super().to_representation(instance)["sign_of_presence"]


class SignOfBiocontrolPresenceTerrestrialSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = SignOfBiocontrolPresenceTerrestrial


class DraftSignOfBiocontrolPresenceTerrestrialSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = DraftSignOfBiocontrolPresenceTerrestrial
