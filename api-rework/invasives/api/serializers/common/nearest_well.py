from rest_framework import serializers
from api.models.activity import WellEntry


class NearestWellSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellEntry
        fields = ("well_tag", "distance")
