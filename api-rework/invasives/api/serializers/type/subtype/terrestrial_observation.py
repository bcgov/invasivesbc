from rest_framework import serializers
from rest_framework.fields import SerializerMethodField

from api.models.activity import (
    SpecificUse,
    PretreatmentObservation,
)
from api.models.activity.observations import (
    TerrestrialPlantObservationEntries,
    TerrestrialVoucherSpecimen,
    TerrestrialPlantObservationContext,
)
from api.serializers.common.codes import (
    SoilTextureCodeSerializer,
    AspectCodeSerializer,
    SlopeCodeSerializer,
)


class TerrestrialVoucherSpecimenSerializer(serializers.ModelSerializer):
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


class TerrestrialPlantObservationEntriesSerializer(serializers.ModelSerializer):
    voucher_specimen = serializers.SerializerMethodField()

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

    def get_voucher_specimen(self, obj):
        children = TerrestrialVoucherSpecimen.objects.filter(
            activity_data_record=obj.activity_data_record
        ).first()
        return (
            TerrestrialVoucherSpecimenSerializer(children).data
            if children is not None
            else None
        )


class SpecificUseSerializer(serializers.ModelSerializer):
    specific_use = serializers.CharField()

    class Meta:
        model = SpecificUse
        fields = ("specific_use",)


class TerrestrialPlantObservationContextSerializer(serializers.ModelSerializer):
    specific_uses = SerializerMethodField()
    soil_texture = SoilTextureCodeSerializer()
    aspect = AspectCodeSerializer()
    slope_percent = SlopeCodeSerializer()

    def get_specific_uses(self, obj):
        children = SpecificUse.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return SpecificUseSerializer(children, many=True).data

    class Meta:
        model = TerrestrialPlantObservationContext
        fields = (
            "research_observation",
            "visible_well_nearby",
            "aspect",
            "slope_percent",
            "soil_texture",
            "specific_uses",
            "suitable_for_biocontrol_agent",
        )


class TerrestrialObservationSerializer(serializers.Serializer):
    context = serializers.SerializerMethodField()
    pretreatment_observation = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()

    def get_pretreatment_observation(self, obj):
        children = PretreatmentObservation.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return children.pre_treatment_observation if children is not None else None

    def get_context(self, obj):
        children = TerrestrialPlantObservationContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            TerrestrialPlantObservationContextSerializer(children).data
            if children is not None
            else None
        )

    def get_entries(self, obj):

        children = TerrestrialPlantObservationEntries.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return TerrestrialPlantObservationEntriesSerializer(children, many=True).data
