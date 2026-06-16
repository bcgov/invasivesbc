from api.serializers.plant_write_serializers import ActivityWriteSerializer
from rest_framework import serializers
from api.models.activity import (
    AquaticPlantObservationContext,
    AquaticPlantObservationEntry,
    PretreatmentObservation,
    ActivityDataRecord,
    AquaticVoucherSpecimen,
    Activity,
    WaterbodyAdjacentLandUse,
    AdjacentLandUseCode,
    ShorelineTypes,
    WaterLevelManagement,
    WaterbodyUse,
    WaterbodyUseCode,
    WaterbodySubstrateType,
    WaterbodySubstrateCode,
    WaterbodyContext,
    WaterbodyFlowCode,
    WaterbodyFlowSeasonalCode,
    WaterbodyInflowPermanent,
    WaterbodyInflowSeasonal,
    WaterbodyOutflowPermanent,
    WaterbodyOutflowSeasonal,
    WaterbodyLevelManagement,
)


class AquaticVoucherSpecimenWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AquaticVoucherSpecimen
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


class AquaticPlantEntrySerializer(serializers.ModelSerializer):
    voucher_specimen = AquaticVoucherSpecimenWriteSerializer(
        required=False, allow_null=True
    )

    class Meta:
        model = AquaticPlantObservationEntry
        fields = (
            "invasive_plant",
            "density",
            "distribution",
            "life_stage",
            "observation_type",
            "sample_point_id",
            "voucher_specimen",
        )


class AquaticContextWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AquaticPlantObservationContext
        fields = ("suitable_for_biocontrol",)


class ShorelineTypesWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShorelineTypes
        fields = (
            "shoreline_type",
            "percent_covered",
        )


class WaterbodyContextWriteSerializer(serializers.ModelSerializer):
    inflow_permanent = serializers.SlugRelatedField(
        many=True,
        slug_field="code",
        queryset=WaterbodyFlowCode.objects.all(),
    )
    inflow_seasonal = serializers.SlugRelatedField(
        many=True,
        slug_field="code",
        queryset=WaterbodyFlowSeasonalCode.objects.all(),
    )
    outflow_permanent = serializers.SlugRelatedField(
        many=True,
        slug_field="code",
        queryset=WaterbodyFlowCode.objects.all(),
    )
    outflow_seasonal = serializers.SlugRelatedField(
        many=True,
        slug_field="code",
        queryset=WaterbodyFlowCode.objects.all(),
    )

    class Meta:
        model = WaterbodyContext
        fields = (
            "inflow_permanent",
            "inflow_seasonal",
            "outflow_permanent",
            "outflow_seasonal",
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


class AquaticSubtypeWriteSerializer(serializers.Serializer):
    context = AquaticContextWriteSerializer(required=True)
    pretreatment_observation = serializers.CharField(required=True)
    waterbody_context = WaterbodyContextWriteSerializer(required=True)
    entries = AquaticPlantEntrySerializer(many=True)
    adjacent_land_use = serializers.SlugRelatedField(
        many=True, slug_field="code", queryset=AdjacentLandUseCode.objects.all()
    )
    shoreline_types = ShorelineTypesWriteSerializer(many=True)
    substrate_type = serializers.SlugRelatedField(
        many=True,
        slug_field="code",
        queryset=WaterbodySubstrateCode.objects.all(),
    )
    waterlevel_management = serializers.SlugRelatedField(
        many=True,
        slug_field="code",
        queryset=WaterLevelManagement.objects.all(),
    )
    water_use = serializers.SlugRelatedField(
        many=True, slug_field="code", queryset=WaterbodyUseCode.objects.all()
    )


class ObservationAquaticWriteSerializer(ActivityWriteSerializer):
    subtype_data = AquaticSubtypeWriteSerializer(required=True)

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        # Context
        adr = ActivityDataRecord.objects.create(activity=parent)
        AquaticPlantObservationContext.objects.create(
            activity_data_record=adr, **subtype_data.get("context", None)
        )
        # Pretreatment
        PretreatmentObservation.objects.create(
            activity_data_record=adr,
            pre_treatment_observation=subtype_data.get(
                "pretreatment_observation", None
            ),
        )

        wb_context: dict = subtype_data.get("waterbody_context", None)
        # Populate Flow Codes before Context to avoid error on extra keys.
        WaterbodyInflowPermanent.objects.bulk_create(
            WaterbodyInflowPermanent(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("inflow_permanent", [])
        )
        WaterbodyInflowSeasonal.objects.bulk_create(
            WaterbodyInflowSeasonal(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("inflow_seasonal", [])
        )
        WaterbodyOutflowPermanent.objects.bulk_create(
            WaterbodyOutflowPermanent(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("outflow_permanent", [])
        )
        WaterbodyOutflowSeasonal.objects.bulk_create(
            WaterbodyOutflowSeasonal(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("outflow_seasonal", [])
        )
        WaterbodyContext.objects.create(activity_data_record=adr, **wb_context)

        # Populate 1:M Arrays of strings
        ShorelineTypes.objects.bulk_create(
            ShorelineTypes(activity_data_record=adr, **shoreline_type)
            for shoreline_type in subtype_data.get("shoreline_types", [])
        )

        WaterbodyUse.objects.bulk_create(
            WaterbodyUse(activity_data_record=adr, waterbody_use=code)
            for code in subtype_data.get("water_use", [])
        )
        WaterbodySubstrateType.objects.bulk_create(
            WaterbodySubstrateType(activity_data_record=adr, substrate_type=code)
            for code in subtype_data.get("substrate_type", [])
        )
        WaterbodyAdjacentLandUse.objects.bulk_create(
            WaterbodyAdjacentLandUse(
                activity_data_record=adr, waterbody_adjacent_land_use=code
            )
            for code in subtype_data.get("adjacent_land_use", [])
        )
        WaterbodyLevelManagement.objects.bulk_create(
            WaterbodyLevelManagement(
                activity_data_record=adr, waterlevel_management=code
            )
            for code in subtype_data.get("waterlevel_management", [])
        )

        # Aquatic Entries
        for entry in subtype_data.get("entries", []):
            voucher_data = entry.pop("voucher_specimen", None)
            # Individual to keep things like Voucher Specimens Linked
            adr = ActivityDataRecord.objects.create(activity=parent)
            AquaticPlantObservationEntry.objects.create(
                activity_data_record=adr, **entry
            )
            if voucher_data:
                AquaticVoucherSpecimen.objects.create(
                    activity_data_record=adr,
                    invasive_plant=entry["invasive_plant"],
                    **voucher_data
                )
