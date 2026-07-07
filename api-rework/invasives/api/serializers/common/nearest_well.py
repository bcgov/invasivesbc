from rest_framework import serializers
from api.models.activity import WellEntry, DraftWellEntry


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ("well_tag", "distance")


class NearestWellSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WellEntry


class DraftNearestWellSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWellEntry
