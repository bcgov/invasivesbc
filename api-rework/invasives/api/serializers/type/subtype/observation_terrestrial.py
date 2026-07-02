from rest_framework import serializers
from api.models.activity import (
    SpecificUse,
    PretreatmentObservation,
    DraftSpecificUse,
    DraftPretreatmentObservation,
)
from api.models.activity.observations import (
    TerrestrialPlantObservationEntries,
    TerrestrialVoucherSpecimen,
    TerrestrialPlantObservationContext,
    DraftTerrestrialPlantObservationEntries,
    DraftTerrestrialVoucherSpecimen,
    DraftTerrestrialPlantObservationContext,
)
from api.serializers.common import (
    TerrestrialVoucherSpecimenSerializer,
    DraftTerrestrialVoucherSpecimenSerializer,
    SpecificUseSerializer,
    DraftSpecificUseSerializer,
)
from api.serializers.common.codes import (
    SoilTextureCodeSerializer,
    AspectCodeSerializer,
    SlopeCodeSerializer,
)


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
            "voucher_specimen",
        )


class TerrestrialPlantObservationEntriesSerializer(BaseEntrySerializer):
    class Meta(BaseEntrySerializer.Meta):
        model = TerrestrialPlantObservationEntries

    def get_voucher_specimen(self, obj):
        children = TerrestrialVoucherSpecimen.objects.filter(
            activity_data_record=obj.activity_data_record
        ).first()
        return (
            TerrestrialVoucherSpecimenSerializer(children).data
            if children is not None
            else None
        )


class DraftTerrestrialPlantObservationEntriesSerializer(BaseEntrySerializer):
    class Meta(BaseEntrySerializer.Meta):
        model = DraftTerrestrialPlantObservationEntries

    def get_voucher_specimen(self, obj):
        children = DraftTerrestrialVoucherSpecimen.objects.filter(
            activity_data_record=obj.activity_data_record
        ).first()
        return (
            DraftTerrestrialVoucherSpecimenSerializer(children).data
            if children is not None
            else None
        )


############
# Serializers for Context
############
class BaseContextSerializer(serializers.ModelSerializer):
    specific_uses = serializers.SerializerMethodField()
    soil_texture = SoilTextureCodeSerializer()
    aspect = AspectCodeSerializer()
    slope_percent = SlopeCodeSerializer()

    class Meta:
        abstract = True
        fields = (
            "research_observation",
            "visible_well_nearby",
            "aspect",
            "slope_percent",
            "soil_texture",
            "specific_uses",
            "suitable_for_biocontrol_agent",
        )


class TerrestrialPlantObservationContextSerializer(BaseContextSerializer):
    class Meta(BaseContextSerializer.Meta):
        model = TerrestrialPlantObservationContext

    def get_specific_uses(self, obj):
        children = SpecificUse.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return SpecificUseSerializer(children, many=True).data


class DraftTerrestrialPlantObservationContextSerializer(BaseContextSerializer):
    class Meta(BaseContextSerializer.Meta):
        model = DraftTerrestrialPlantObservationContext

    def get_specific_uses(self, obj):
        children = DraftSpecificUse.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return DraftSpecificUseSerializer(children, many=True).data


############
# Serializers for Subtype Data
############


class BaseSerializer(serializers.Serializer):
    context = serializers.SerializerMethodField()
    pretreatment_observation = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()

    class Meta:
        abstract = True


class TerrestrialObservationSerializer(BaseSerializer):
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


class DraftTerrestrialObservationSerializer(BaseSerializer):
    def get_pretreatment_observation(self, obj):
        children = DraftPretreatmentObservation.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return children.pre_treatment_observation if children is not None else None

    def get_context(self, obj):
        children = DraftTerrestrialPlantObservationContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftTerrestrialPlantObservationContextSerializer(children).data
            if children is not None
            else None
        )

    def get_entries(self, obj):
        children = DraftTerrestrialPlantObservationEntries.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftTerrestrialPlantObservationEntriesSerializer(
            children, many=True
        ).data
