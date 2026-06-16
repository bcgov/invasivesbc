from rest_framework import serializers

from api.models.activity import (
    AquaticPlantMechanicalTreatmentEntry,
    AquaticMechanicalAuthorization,
    ShorelineTypes,
)
from api.serializers.common import ShorelineTypesSerializer


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
    authorization_information = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()
    shoreline_types = serializers.SerializerMethodField()

    def get_authorization_information(self, obj):
        child = AquaticMechanicalAuthorization.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return child.authorization_information if child else None

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
