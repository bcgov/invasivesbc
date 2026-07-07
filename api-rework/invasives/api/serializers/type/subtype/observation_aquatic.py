from rest_framework import serializers
from api.serializers.common import (
    ShorelineTypesSerializer,
    WaterbodyOutflowPermanentSerializer,
    WaterbodyOutflowSeasonalSerializer,
    WaterbodyInflowPermanentSerializer,
    WaterbodyInflowSeasonalSerializer,
    DraftWaterbodyOutflowPermanentSerializer,
    DraftWaterbodyOutflowSeasonalSerializer,
    DraftWaterbodyInflowPermanentSerializer,
    DraftWaterbodyInflowSeasonalSerializer,
    AquaticVoucherSpecimenSerializer,
    DraftAquaticVoucherSpecimenSerializer,
    WaterbodyAdjacentLandUseSerializer,
    WaterbodyLevelManagementSerializer,
    WaterbodySubstrateTypeSerializer,
    WaterbodyUseSerializer,
    DraftShorelineTypesSerializer,
    DraftWaterbodyAdjacentLandUseSerializer,
    DraftWaterbodyLevelManagementSerializer,
    DraftWaterbodySubstrateTypeSerializer,
    DraftWaterbodyUseSerializer,
)
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
    DraftAquaticPlantObservationContext,
    DraftAquaticPlantObservationEntry,
    DraftAquaticVoucherSpecimen,
    DraftWaterbodySubstrateType,
    DraftWaterbodyOutflowPermanent,
    DraftWaterbodyOutflowSeasonal,
    DraftWaterbodyInflowPermanent,
    DraftWaterbodyInflowSeasonal,
    DraftWaterbodyContext,
    DraftWaterbodyUse,
    DraftWaterbodyLevelManagement,
    DraftWaterbodyAdjacentLandUse,
    DraftPretreatmentObservation,
    DraftShorelineTypes,
)


class BaseWaterbodyContext(serializers.ModelSerializer):
    inflow_permanent = serializers.SerializerMethodField()
    inflow_seasonal = serializers.SerializerMethodField()
    outflow_permanent = serializers.SerializerMethodField()
    outflow_seasonal = serializers.SerializerMethodField()

    class Meta:
        abstract = True
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
            "inflow_permanent",
            "inflow_seasonal",
            "outflow_permanent",
            "outflow_seasonal",
        )


############
# Serializers for Waterbody Context
############
class WaterbodyContextSerializer(BaseWaterbodyContext):
    class Meta(BaseWaterbodyContext.Meta):
        model = WaterbodyContext

    def get_inflow_permanent(self, obj):
        children = WaterbodyInflowPermanent.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return WaterbodyInflowPermanentSerializer(children, many=True).data

    def get_inflow_seasonal(self, obj):
        children = WaterbodyInflowSeasonal.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return WaterbodyInflowSeasonalSerializer(children, many=True).data

    def get_outflow_permanent(self, obj):
        children = WaterbodyOutflowPermanent.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return WaterbodyOutflowPermanentSerializer(children, many=True).data

    def get_outflow_seasonal(self, obj):
        children = WaterbodyOutflowSeasonal.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return WaterbodyOutflowSeasonalSerializer(children, many=True).data


class DraftWaterbodyContextSerializer(BaseWaterbodyContext):
    class Meta(BaseWaterbodyContext.Meta):
        model = DraftWaterbodyContext

    def get_inflow_permanent(self, obj):
        children = DraftWaterbodyInflowPermanent.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return DraftWaterbodyInflowPermanentSerializer(children, many=True).data

    def get_inflow_seasonal(self, obj):
        children = DraftWaterbodyInflowSeasonal.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return DraftWaterbodyInflowSeasonalSerializer(children, many=True).data

    def get_outflow_permanent(self, obj):
        children = DraftWaterbodyOutflowPermanent.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return DraftWaterbodyOutflowPermanentSerializer(children, many=True).data

    def get_outflow_seasonal(self, obj):
        children = DraftWaterbodyOutflowSeasonal.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return DraftWaterbodyOutflowSeasonalSerializer(children, many=True).data


############
# Serializers for Observation Context
############
class BaseContextSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["suitable_for_biocontrol"]


class AquaticPlantObservationContextSerializer(BaseContextSerializer):

    class Meta(BaseContextSerializer.Meta):
        model = AquaticPlantObservationContext


class DraftAquaticPlantObservationContextSerializer(BaseContextSerializer):

    class Meta(BaseContextSerializer.Meta):
        model = DraftAquaticPlantObservationContext


############
# Serializers for Entries
############


class BaseEntrySerializer(serializers.ModelSerializer):
    voucher_specimen = serializers.SerializerMethodField()

    class Meta:
        abstract = True
        fields = (
            "density",
            "distribution",
            "invasive_plant",
            "life_stage",
            "observation_type",
            "sample_point_id",
            "voucher_specimen",
        )


class AquaticPlantObservationEntrySerializer(BaseEntrySerializer):

    class Meta(BaseEntrySerializer.Meta):
        model = AquaticPlantObservationEntry

    def get_voucher_specimen(self, obj):
        voucher_specimen = AquaticVoucherSpecimen.objects.filter(
            activity_data_record=obj.activity_data_record
        ).first()
        return (
            AquaticVoucherSpecimenSerializer(voucher_specimen).data
            if voucher_specimen is not None
            else None
        )


class DraftAquaticPlantObservationEntrySerializer(BaseEntrySerializer):

    class Meta(BaseEntrySerializer.Meta):
        model = DraftAquaticPlantObservationEntry

    def get_voucher_specimen(self, obj):
        voucher_specimen = DraftAquaticVoucherSpecimen.objects.filter(
            activity_data_record=obj.activity_data_record
        ).first()
        return (
            DraftAquaticVoucherSpecimenSerializer(voucher_specimen).data
            if voucher_specimen is not None
            else None
        )


############
# Serializers for Subtype Data
############


class BaseSerializer(serializers.Serializer):
    adjacent_land_use = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()
    pretreatment_observation = serializers.SerializerMethodField()
    substrate_type = serializers.SerializerMethodField()
    context = serializers.SerializerMethodField()
    waterbody_context = serializers.SerializerMethodField()
    water_use = serializers.SerializerMethodField()
    waterlevel_management = serializers.SerializerMethodField()
    shoreline_types = serializers.SerializerMethodField()

    class Meta:
        abstract = True


class AquaticObservationSerializer(BaseSerializer):

    def get_adjacent_land_use(self, obj):
        children = WaterbodyAdjacentLandUse.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return WaterbodyAdjacentLandUseSerializer(children, many=True).data

    def get_entries(self, obj):
        children = AquaticPlantObservationEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return AquaticPlantObservationEntrySerializer(children, many=True).data

    def get_pretreatment_observation(self, obj):
        child = PretreatmentObservation.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        if child is not None:
            return child.pre_treatment_observation
        return None

    def get_substrate_type(self, obj):
        children = WaterbodySubstrateType.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return WaterbodySubstrateTypeSerializer(children, many=True).data

    def get_context(self, obj):
        children = AquaticPlantObservationContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            AquaticPlantObservationContextSerializer(children).data
            if children is not None
            else None
        )

    def get_waterbody_context(self, obj):
        children = WaterbodyContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            WaterbodyContextSerializer(children).data if children is not None else None
        )

    def get_water_use(self, obj):
        children = WaterbodyUse.objects.filter(activity_data_record__activity_id=obj.id)
        return WaterbodyUseSerializer(children, many=True).data

    def get_waterlevel_management(self, obj):
        children = WaterbodyLevelManagement.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return WaterbodyLevelManagementSerializer(children, many=True).data

    def get_shoreline_types(self, obj):
        children = ShorelineTypes.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return ShorelineTypesSerializer(children, many=True).data


class DraftAquaticObservationSerializer(BaseSerializer):

    def get_adjacent_land_use(self, obj):
        children = DraftWaterbodyAdjacentLandUse.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftWaterbodyAdjacentLandUseSerializer(children, many=True).data

    def get_entries(self, obj):
        children = DraftAquaticPlantObservationEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftAquaticPlantObservationEntrySerializer(children, many=True).data

    def get_pretreatment_observation(self, obj):
        child = DraftPretreatmentObservation.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        if child is not None:
            return child.pre_treatment_observation
        return None

    def get_substrate_type(self, obj):
        children = DraftWaterbodySubstrateType.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftWaterbodySubstrateTypeSerializer(children, many=True).data

    def get_context(self, obj):
        children = DraftAquaticPlantObservationContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftAquaticPlantObservationContextSerializer(children).data
            if children is not None
            else None
        )

    def get_waterbody_context(self, obj):
        children = DraftWaterbodyContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftWaterbodyContextSerializer(children).data
            if children is not None
            else None
        )

    def get_water_use(self, obj):
        children = DraftWaterbodyUse.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftWaterbodyUseSerializer(children, many=True).data

    def get_waterlevel_management(self, obj):
        children = DraftWaterbodyLevelManagement.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftWaterbodyLevelManagementSerializer(children, many=True).data

    def get_shoreline_types(self, obj):
        children = DraftShorelineTypes.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftShorelineTypesSerializer(children, many=True).data
