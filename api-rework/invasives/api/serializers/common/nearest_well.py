from rest_framework import serializers
from api.models.activity import NearestWell


class NearestWellSerializer(serializers.ModelSerializer):
    class Meta:
        model = NearestWell
        fields = ("well_tag_number", "distance")
