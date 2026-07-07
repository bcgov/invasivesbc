from rest_framework import serializers
from api.models.activity import Jurisdiction, DraftJurisdiction


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ("jurisdiction", "percent_covered")


class JurisdictionSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = Jurisdiction


class DraftJurisdictionSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = DraftJurisdiction
