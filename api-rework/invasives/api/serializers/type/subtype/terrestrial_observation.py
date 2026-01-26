from abc import abstractclassmethod

from rest_framework import serializers

from api.models.activity import TerrestrialBiocontrolRelease
from api.models.activity.observations import (
    TerrestrialPlantObservationDetail,
    TerrestrialVoucherSpecimen,
    TerrestrialPlantObservationInfo,
)
from api.models.codes import (
    AspectCode,
    SlopePercentCode,
    SoilTextureCode,
    SpecificUseCode,
)


class BaseCodeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "code",
            "full",
        )


class SpecificUseCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = SpecificUseCode
        fields = BaseCodeSerializer.Meta.fields


class SoilTextureCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = SoilTextureCode
        fields = BaseCodeSerializer.Meta.fields


class AspectCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = AspectCode
        fields = BaseCodeSerializer.Meta.fields


class SlopeCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = SlopePercentCode
        fields = BaseCodeSerializer.Meta.fields


class TerrestrialVoucherSpecimenSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialVoucherSpecimen
        fields = (
            "invasive_plant",
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


class TerrestrialPlantObservationDetailSerializer(serializers.ModelSerializer):
    voucher_specimen = serializers.SerializerMethodField()

    class Meta:
        model = TerrestrialPlantObservationDetail
        fields = (
            "density",
            "distribution",
            "invasive_plant",
            "life_stage",
            "observation_type",
            "voucher_specimen",
        )

    def get_voucher_specimen(self, obj):
        """Search for Voucher Specimen matching the record"""
        activity = getattr(obj, "activity", None)
        invasive_plant = obj.invasive_plant

        if not activity or not invasive_plant:
            return None

        try:
            voucher_specimen = TerrestrialVoucherSpecimen.objects.get(
                activity=activity, invasive_plant=invasive_plant
            )
            return TerrestrialVoucherSpecimenSerializer(voucher_specimen).data
        except TerrestrialVoucherSpecimen.DoesNotExist:
            return None


class TerrestrialPlantObservationInfoSerializer(serializers.ModelSerializer):
    specific_use = SpecificUseCodeSerializer()
    soil_texture = SoilTextureCodeSerializer()
    aspect = AspectCodeSerializer()
    slope_percent = SlopeCodeSerializer()

    class Meta:
        model = TerrestrialPlantObservationInfo
        fields = (
            "research_observation",
            "visible_well_nearby",
            "aspect",
            "slope_percent",
            "soil_texture",
            "specific_use",
            "suitable_for_biocontrol_agent",
        )


class TerrestrialObservationSerializer(serializers.Serializer):
    observation_details = TerrestrialPlantObservationDetailSerializer(
        source="terrestrialplantobservationdetail_set", many=True
    )
    observation_information = TerrestrialPlantObservationInfoSerializer(
        source="terrestrialplantobservationinfo"
    )
    pretreatment_observation = serializers.CharField(
        source="pretreatmentobservation.pre_treatment_observation"
    )

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        info_data = ret.pop("observation_information", None)

        if info_data and isinstance(info_data, dict):
            ret.update(info_data)
        return ret
