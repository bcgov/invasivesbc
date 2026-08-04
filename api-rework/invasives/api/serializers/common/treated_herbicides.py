from rest_framework import serializers
from api.models.activity import (
    LiquidHerbicideEntry,
    GranularHerbicideEntry,
    DraftLiquidHerbicideEntry,
    DraftGranularHerbicideEntry,
)


class BaseSerializer(serializers.ModelSerializer):
    application_rate = serializers.FloatField(source="product_application_rate")

    class Meta:
        abstract = True
        fields = ("type", "name", "application_rate")


class GranularHerbicideSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = GranularHerbicideEntry


class LiquidHerbicideSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = LiquidHerbicideEntry


class DraftGranularHerbicideSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftGranularHerbicideEntry


class DraftLiquidHerbicideSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftLiquidHerbicideEntry
