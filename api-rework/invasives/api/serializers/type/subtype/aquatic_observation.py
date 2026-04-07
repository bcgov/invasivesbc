from rest_framework import serializers

from api.models.codes import WaterbodyTypeCode
from api.serializers.common import ShorelineTypesSerializer
from api.models.activity import (
    AquaticPlantObservationContext,
    AquaticPlantObservationEntry,
    AquaticVoucherSpecimen,
    WaterbodySubstrateType,
    WaterbodyOutflowPermanent,
    WaterbodyOutflowSeasonal,
    WaterbodyInflowPermanent,
    WaterbodyInflowSeasonal,
    WaterbodyContext,
    WaterbodyUse,
    WaterbodyLevelManagement,
    WaterbodyAdjacentLandUse,
    PretreatmentObservation,
    ShorelineTypes,
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
        model = WaterbodyTypeCode
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


class AquaticPlantObservationContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = AquaticPlantObservationContext
        fields = ["suitable_for_biocontrol"]


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
        voucher_specimen = AquaticVoucherSpecimen.objects.filter(
            activity_data_record=obj.activity_data_record
        ).first()
        return (
            AquaticVoucherSpecimenSerializer(voucher_specimen).data
            if voucher_specimen is not None
            else None
        )


class AquaticObservationSerializer(serializers.Serializer):
    adjacent_land_use = serializers.SerializerMethodField()

    def get_adjacent_land_use(self, obj):
        children = WaterbodyAdjacentLandUse.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return WaterbodyAdjacentLandUseSerializer(children, many=True).data

    entries = serializers.SerializerMethodField()

    def get_entries(self, obj):
        children = AquaticPlantObservationEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return AquaticPlantObservationEntrySerializer(children, many=True).data

    pretreatment_observation = serializers.SerializerMethodField()

    def get_pretreatment_observation(self, obj):
        child = PretreatmentObservation.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        if child is not None:
            return child.pre_treatment_observation
        return None

    substrate_type = serializers.SerializerMethodField()

    def get_substrate_type(self, obj):
        children = WaterbodySubstrateType.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return WaterbodySubstrateTypeSerializer(children, many=True).data

    aquatic_observation_context = serializers.SerializerMethodField()

    def get_aquatic_observation_context(self, obj):
        children = AquaticPlantObservationContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            AquaticPlantObservationContextSerializer(children).data
            if children is not None
            else None
        )

    waterbody_context = serializers.SerializerMethodField()

    def get_waterbody_context(self, obj):
        children = WaterbodyContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return WaterbodyDataSerializer(children).data if children is not None else None

    water_use = serializers.SerializerMethodField()

    def get_water_use(self, obj):
        children = WaterbodyUse.objects.filter(activity_data_record__activity_id=obj.id)
        return WaterbodyUseSerializer(children, many=True).data

    waterlevel_management = serializers.SerializerMethodField()

    def get_waterlevel_management(self, obj):
        children = WaterbodyLevelManagement.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return WaterbodyLevelManagementSerializer(children, many=True).data

    shoreline_types = serializers.SerializerMethodField()

    def get_shoreline_types(self, obj):
        children = ShorelineTypes.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return ShorelineTypesSerializer(children, many=True).data

    # Water Flow
    inflow_permanent = serializers.SerializerMethodField()
    inflow_seasonal = serializers.SerializerMethodField()
    outflow_permanent = serializers.SerializerMethodField()
    outflow_seasonal = serializers.SerializerMethodField()

    def get_inflow_seasonal(self, obj):
        children = WaterbodyInflowSeasonal.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return FlowSerializer(children, many=True).data

    def get_inflow_permanent(self, obj):
        children = WaterbodyInflowPermanent.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return FlowSerializer(children, many=True).data

    def get_outflow_permanent(self, obj):
        children = WaterbodyOutflowPermanent.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return FlowSerializer(children, many=True).data

    def get_outflow_seasonal(self, obj):
        children = WaterbodyOutflowSeasonal.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return FlowSerializer(children, many=True).data
