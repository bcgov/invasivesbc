from rest_framework import serializers

from api.models.activity import (
    AquaticPlantMechanicalTreatmentEntry,
    AquaticMechanicalAuthorization,
    ShorelineTypes,
    DraftAquaticPlantMechanicalTreatmentEntry,
    DraftAquaticMechanicalAuthorization,
    DraftShorelineTypes,
)
from api.serializers.common import (
    ShorelineTypesSerializer,
    DraftShorelineTypesSerializer,
)


############
# Serializers for Entries
############
class BaseEntrySerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = (
            "disposed_material_amount",
            "disposed_material_format",
            "disposal_method",
            "invasive_plant",
            "mechanical_method",
            "treated_area_msq",
        )


class AquaticPlantMechanicalTreatmentSerializer(BaseEntrySerializer):
    class Meta(BaseEntrySerializer.Meta):
        model = AquaticPlantMechanicalTreatmentEntry


class DraftAquaticPlantMechanicalTreatmentSerializer(BaseEntrySerializer):
    class Meta(BaseEntrySerializer.Meta):
        model = DraftAquaticPlantMechanicalTreatmentEntry


############
# Serializers for Subtype Data
############
class BaseSerializer(serializers.Serializer):
    authorization_information = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()
    shoreline_types = serializers.SerializerMethodField()

    class Meta:
        abstract = True


class AquaticPlantTreatmentMechanicalSerializer(BaseSerializer):

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


class DraftAquaticPlantTreatmentMechanicalSerializer(BaseSerializer):

    def get_authorization_information(self, obj):
        child = DraftAquaticMechanicalAuthorization.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return child.authorization_information if child else None

    def get_shoreline_types(self, obj):
        children = DraftShorelineTypes.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftShorelineTypesSerializer(children, many=True).data

    def get_entries(self, obj):
        children = DraftAquaticPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftAquaticPlantMechanicalTreatmentSerializer(children, many=True).data
