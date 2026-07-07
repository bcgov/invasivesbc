from rest_framework import serializers
from api.models.activity import (
    WaterbodyOutflowPermanent,
    WaterbodyOutflowSeasonal,
    WaterbodyInflowPermanent,
    WaterbodyInflowSeasonal,
    DraftWaterbodyOutflowPermanent,
    DraftWaterbodyOutflowSeasonal,
    DraftWaterbodyInflowPermanent,
    DraftWaterbodyInflowSeasonal,
)


####
# Waterbody Flow Codes
####
class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["flow_code"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["flow_code"]


class WaterbodyOutflowPermanentSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WaterbodyOutflowPermanent


class WaterbodyOutflowSeasonalSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WaterbodyOutflowSeasonal


class WaterbodyInflowPermanentSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WaterbodyInflowPermanent


class WaterbodyInflowSeasonalSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WaterbodyInflowSeasonal


class DraftWaterbodyOutflowPermanentSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWaterbodyOutflowPermanent


class DraftWaterbodyOutflowSeasonalSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWaterbodyOutflowSeasonal


class DraftWaterbodyInflowPermanentSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWaterbodyInflowPermanent


class DraftWaterbodyInflowSeasonalSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWaterbodyInflowSeasonal
