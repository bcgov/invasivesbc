from api.serializers.plant_write_serializers import ActivityWriteSerializer
from rest_framework import serializers
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    AquaticPlantMechanicalTreatmentEntry,
    ShorelineTypes,
    AquaticMechanicalAuthorization,
)


class ShorelineTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShorelineTypes
        fields = (
            "shoreline_type",
            "percent_covered",
        )


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = AquaticPlantMechanicalTreatmentEntry
        fields = (
            "invasive_plant",
            "treated_area_msq",
            "mechanical_method",
            "disposal_method",
            "disposed_material_format",
            "disposed_material_amount",
        )


class SubtypeWriteSerializer(serializers.Serializer):
    entries = EntrySerializer(many=True)
    shoreline_types = ShorelineTypeSerializer(many=True, required=True)
    authorization_information = serializers.CharField(allow_null=True)


class TreatmentMechanicalAquaticWriteSerializer(ActivityWriteSerializer):
    subtype_data = SubtypeWriteSerializer(write_only=True, required=True)

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)

        ShorelineTypes.objects.bulk_create(
            ShorelineTypes(activity_data_record=adr, **shoreline_type)
            for shoreline_type in subtype_data.get("shoreline_types", [])
        )
        AquaticPlantMechanicalTreatmentEntry.objects.bulk_create(
            AquaticPlantMechanicalTreatmentEntry(activity_data_record=adr, **entry)
            for entry in subtype_data.get("entries", [])
        )
        auth_info = subtype_data.get("authorization_information")
        if auth_info:
            AquaticMechanicalAuthorization.objects.create(
                activity_data_record=adr, authorization_information=auth_info
            )
