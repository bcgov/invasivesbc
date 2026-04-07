from rest_framework import serializers

from api.models.activity import (
    AquaticPlantMechanicalTreatmentEntry,
    AquaticMechanicalAuthorization,
    ShorelineTypes,
    WellEntry,
)
from api.serializers.common import ShorelineTypesSerializer, NearestWellSerializer


class AquaticMechanicalAuthorizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AquaticMechanicalAuthorization
        fields = ("authorization_information",)


class AquaticPlantMechanicalTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AquaticPlantMechanicalTreatmentEntry
        fields = (
            "disposed_material_amount",
            "disposed_material_format",
            "disposal_method",
            "invasive_plant",
            "mechanical_method",
            "treated_area_msq",
        )


class AquaticPlantTreatmentMechanicalSerializer(serializers.Serializer):

    authorization_info = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()
    shoreline_types = serializers.SerializerMethodField()
    well_entries = serializers.SerializerMethodField()

    def get_authorization_info(self, obj):
        children = AquaticMechanicalAuthorization.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return AquaticMechanicalAuthorizationSerializer(children, many=True).data

    def get_shoreline_types(self, obj):
        children = ShorelineTypes.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return ShorelineTypesSerializer(children, many=True).data

    def get_entries(self, obj):
        children = AquaticPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return AquaticPlantMechanicalTreatmentSerializer(children, many=True).data

    def get_well_entries(self, obj):
        children = WellEntry.objects.filter(activity_data_record__activity_id=obj.id)
        return NearestWellSerializer(children, many=True).data
