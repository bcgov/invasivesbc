from api.serializers.plant_write_serializers import ActivityWriteSerializer
from rest_framework import serializers

from api.models.activity import (
    ActivityDataRecord,
    SpecificUse,
    Activity,
    PretreatmentObservation,
    TerrestrialVoucherSpecimen,
    TerrestrialPlantObservationContext,
    TerrestrialPlantObservationEntries,
)


class SpecificUseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecificUse
        fields = ("specific_use",)


class TerrestrialContextWriteSerializer(serializers.ModelSerializer):
    specific_uses = SpecificUseWriteSerializer(many=True)

    class Meta:
        model = TerrestrialPlantObservationContext
        fields = (
            "soil_texture",
            "aspect",
            "slope_percent",
            "research_observation",
            "visible_well_nearby",
            "suitable_for_biocontrol_agent",
            "specific_uses",
        )


class TerrestrialVoucherSpecimenWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialVoucherSpecimen
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


class TerrestrialPlantObservationEntriesWriteSerializer(serializers.ModelSerializer):
    voucher_specimen = TerrestrialVoucherSpecimenWriteSerializer(
        required=False, allow_null=True
    )

    class Meta:
        model = TerrestrialPlantObservationEntries
        fields = (
            "density",
            "distribution",
            "invasive_plant",
            "life_stage",
            "observation_type",
            "voucher_specimen",
        )


class TerrestrialSubtypeWriteSerializer(serializers.Serializer):
    context = TerrestrialContextWriteSerializer(required=False)
    pretreatment_observation = serializers.CharField(required=False)
    entries = TerrestrialPlantObservationEntriesWriteSerializer(many=True)


class ObservationTerrestrialWriteSerializer(ActivityWriteSerializer):
    subtype_data = TerrestrialSubtypeWriteSerializer(write_only=True, required=True)

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        # Populate Observation Context.
        context_data = subtype_data.get("context")
        if context_data:
            adr = ActivityDataRecord.objects.create(activity=parent)
            specific_uses = context_data.pop("specific_uses", [])
            TerrestrialPlantObservationContext.objects.create(
                activity_data_record=adr, **context_data
            )
            for su in specific_uses:
                serial = SpecificUseWriteSerializer(data=su)
                serial.is_valid(raise_exception=True)
                serial.save(activity_data_record=adr)

        # Populate Pre-treatment Observation Fields
        pretreat_data = subtype_data.get("pretreatment_observation")
        if pretreat_data:
            adr = ActivityDataRecord.objects.create(activity=parent)
            PretreatmentObservation.objects.create(
                activity_data_record=adr, pre_treatment_observation=pretreat_data
            )

        # Populate Entries
        for entry in subtype_data.get("entries", []):
            voucher_data = entry.pop("voucher_specimen", None)

            adr = ActivityDataRecord.objects.create(activity=parent)
            TerrestrialPlantObservationEntries.objects.create(
                activity_data_record=adr, **entry
            )

            if voucher_data:
                TerrestrialVoucherSpecimen.objects.create(
                    activity_data_record=adr,
                    invasive_plant=entry["invasive_plant"],
                    **voucher_data
                )
