from rest_framework import serializers

from api.models.activity.jurisdictions import Jurisdiction


class JurisdictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jurisdiction
        fields = (
            "jurisdiction",
            "percent_covered"
        )
