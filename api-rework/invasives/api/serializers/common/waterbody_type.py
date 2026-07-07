from rest_framework import serializers
from api.models.activity import (
    WaterbodyTypeCode,
)


class WaterbodyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = WaterbodyTypeCode
        fields = ["substrate_type"]
