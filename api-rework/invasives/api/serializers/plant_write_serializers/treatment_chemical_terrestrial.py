from api.serializers.plant_write_serializers import ActivityWriteSerializer
from rest_framework import serializers
import logging
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    WellEntry,
    ChemicalTreatmentContext,
)

log = logging.getLogger(__name__)


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = None
        fields = ("__all__",)


class WellSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellEntry
        fields = (
            "well_tag",
            "distance",
        )


class ChemicalContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChemicalTreatmentContext
        fields = (
            "pesticide_use_permit",
            "pest_management_plan",
            "pest_management_plan_manual",
            "pesticide_employer_code",
            "temperature_c",
            "wind_speed_kmh",
            "wind_direction",
            "application_start_time",
            "humidity",
            "treatment_notice_signs",
            "precautionary_statement",
            "ntz_reduction",
            "rationale_for_ntz_reduction",
            "additional_unmapped_well_water",
            "pest_injury_threshold_determination",
        )


class SubtypeWriteSerializer(serializers.Serializer):
    context = ChemicalContextSerializer(required=True)
    well_entries = WellSerializer(many=True)
    treatment_context = serializers.JSONField(required=True)  # NEEDS IMPLEMENTATION


class TreatmentChemicalTerrestrialWriteSerializer(ActivityWriteSerializer):
    subtype_data = SubtypeWriteSerializer(write_only=True, required=True)

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        ChemicalTreatmentContext.objects.create(
            activity_data_record=adr, **subtype_data.get("context")
        )
        WellEntry.objects.bulk_create(
            WellEntry(activity_data_record=adr, **well)
            for well in subtype_data.get("well_entries", [])
        )
        log.error(
            f"[{parent.short_id}] And attempt was made to create a {parent.subtype} activity. This has not been fully implemented, data loss will occur."
        )
