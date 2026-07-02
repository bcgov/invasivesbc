from rest_framework import serializers
from api.models.activity import (
    TerrestrialVoucherSpecimen,
    AquaticVoucherSpecimen,
    DraftTerrestrialVoucherSpecimen,
    DraftAquaticVoucherSpecimen,
)


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = (
            "voucher_sample_id",
            "date_collected",
            "date_verified",
            "herbarium",
            "accession_number",
            "completed_by_person",
            "completed_by_org",
            "utm_zone",
            "utm_easting",
            "utm_northing",
        )


class TerrestrialVoucherSpecimenSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = TerrestrialVoucherSpecimen


class AquaticVoucherSpecimenSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = AquaticVoucherSpecimen


class DraftTerrestrialVoucherSpecimenSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftTerrestrialVoucherSpecimen


class DraftAquaticVoucherSpecimenSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftAquaticVoucherSpecimen
