from rest_framework import serializers
from api.serializers.common import ShorelineTypesSerializer
from api.models.activity import (
    AquaticPlantObservationEntry,
    AquaticVoucherSpecimen,
    WaterbodySubstrateType,
    WaterbodyOutflowPermanent,
    WaterbodyOutflowSeasonal,
    WaterbodyInflowPermanent,
    WaterbodyInflowSeasonal,
    WaterbodyType,
    WaterbodyContext,
    WaterbodyUse,
    WaterbodyLevelManagement,
    WaterbodyAdjacentLandUse,
)


####
# Waterbody Flow Codes
####
class FlowSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["flow_code"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["flow_code"]


class WaterbodyOutflowPermanentSerializer(FlowSerializer):
    class Meta(FlowSerializer.Meta):
        model = WaterbodyOutflowPermanent


class WaterbodyOutflowSeasonalSerializer(FlowSerializer):
    class Meta(FlowSerializer.Meta):
        model = WaterbodyOutflowSeasonal


class WaterbodyInflowPermanentSerializer(FlowSerializer):
    class Meta(FlowSerializer.Meta):
        model = WaterbodyInflowPermanent


class WaterbodyInflowSeasonalSerializer(FlowSerializer):
    class Meta(FlowSerializer.Meta):
        model = WaterbodyInflowSeasonal


####
# Waterbody Flow Codes
####


class WaterbodyAdjacentLandUseSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterbodyAdjacentLandUse
        fields = ["waterbody_adjacent_land_use"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["waterbody_adjacent_land_use"]


class WaterbodySubstrateTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterbodySubstrateType
        fields = ["substrate_type"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["substrate_type"]


class WaterbodyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterbodyType
        fields = ["flow_code"]


class WaterbodyUseSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterbodyUse
        fields = ["waterbody_use"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["waterbody_use"]


class WaterbodyLevelManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterbodyLevelManagement
        fields = ["waterlevel_management"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["waterlevel_management"]


class WaterbodyDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterbodyContext
        fields = (
            "access",
            "colour",
            "comment",
            "max_depth_m",
            "name_gazetted",
            "name_local",
            "secchi_depth",
            "tidal_influence",
            "type",
        )


class AquaticVoucherSpecimenSerializer(serializers.ModelSerializer):
    class Meta:
        model = AquaticVoucherSpecimen
        fields = (
            "accession_number",
            "completed_by_org",
            "completed_by_person",
            "date_collected",
            "date_verified",
            "herbarium",
            "invasive_plant",
            "utm_zone",
            "utm_easting",
            "utm_northing",
            "voucher_sample_id",
        )


class AquaticPlantObservationEntrySerializer(serializers.ModelSerializer):
    voucher_specimen = serializers.SerializerMethodField()

    class Meta:
        model = AquaticPlantObservationEntry
        fields = (
            "density",
            "distribution",
            "invasive_plant",
            "life_stage",
            "observation_type",
            "sample_point_id",
            "voucher_specimen",
        )

    def get_voucher_specimen(self, obj):
        """Search for Voucher Specimen matching the record"""
        activity = getattr(obj, "activity", None)
        invasive_plant = obj.invasive_plant

        if not activity or not invasive_plant:
            return None

        try:
            voucher_specimen = AquaticVoucherSpecimen.objects.get(
                activity=activity, invasive_plant=invasive_plant
            )
            return AquaticVoucherSpecimenSerializer(voucher_specimen).data
        except AquaticVoucherSpecimen.DoesNotExist:
            return None


class AquaticObservationSerializer(serializers.Serializer):
    adjacent_land_use = WaterbodyAdjacentLandUseSerializer(
        source="waterbodyadjacentlanduse_set", many=True
    )
    entries = AquaticPlantObservationEntrySerializer(
        source="aquaticplantobservationentry_set", many=True
    )
    pretreatment_observation = serializers.CharField(
        source="pretreatmentobservation.pre_treatment_observation"
    )
    substrate_type = WaterbodySubstrateTypeSerializer(
        source="waterbodysubstratetype_set", many=True
    )
    # @todo add to subtype obs model
    # suitable_for_biocontrol = serializers.CharField(
    #     source="suitableforbiocontrol.suitable_for_biocontrol"
    # )
    waterbody_context = WaterbodyDataSerializer(source="waterbodycontext")
    water_use = WaterbodyUseSerializer(source="waterbodyuse_set", many=True)
    waterlevel_management = WaterbodyLevelManagementSerializer(
        source="waterbodylevelmanagement_set", many=True
    )
    shoreline_types = ShorelineTypesSerializer(source="shorelinetypes_set", many=True)

    # Water Flow
    inflow_permanent = WaterbodyInflowPermanentSerializer(
        source="waterbodyinflowpermanent_set", many=True
    )
    inflow_seasonal = WaterbodyInflowSeasonalSerializer(
        source="waterbodyinflowseasonal_set", many=True
    )
    outflow_permanent = WaterbodyOutflowPermanentSerializer(
        source="waterbodyoutflowpermanent_set", many=True
    )
    outflow_seasonal = WaterbodyOutflowSeasonalSerializer(
        source="waterbodyoutflowseasonal_set", many=True
    )

    def to_representation(self, instance):
        """Flatten Waterbody Details into top_level"""
        ret = super().to_representation(instance)
        info_data = ret.pop("waterbody_context", None)

        if info_data and isinstance(info_data, dict):
            ret.update(info_data)
        return ret
