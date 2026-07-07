from rest_framework import serializers
from api.models.activity import FundingAgency, DraftFundingAgency


class BaseSerializer(serializers.ModelSerializer):
    invasive_species_agency_code = serializers.CharField(source="agency_id")

    class Meta:
        abstract = True
        fields = ["invasive_species_agency_code"]


class FundingAgencySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = FundingAgency


class DraftFundingAgencySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftFundingAgency
