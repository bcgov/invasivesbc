from api.serializers.plant_write_serializers import ActivityWriteSerializer
from rest_framework import serializers
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    TerrestrialPlantMechanicalTreatmentEntry,
)


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialPlantMechanicalTreatmentEntry
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


class TreatmentMechanicalTerrestrialWriteSerializer(ActivityWriteSerializer):
    subtype_data = SubtypeWriteSerializer(write_only=True, required=True)

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        TerrestrialPlantMechanicalTreatmentEntry.objects.bulk_create(
            TerrestrialPlantMechanicalTreatmentEntry(activity_data_record=adr, **entry)
            for entry in subtype_data.get("entries", [])
        )
